
from io import BytesIO
from multiprocessing import Value
import zipfile
import json
import xml.etree.ElementTree as ET
import sys


# mapping to each string as encoded in the json
GUITAR_STRINGS_ENCODED = {
    'E3': 'E',
    'A3': 'A',
    'D4': 'D',
    'G4': 'G',
    'B4': 'B',
    'E5': 'E_HIGH',
}
ENCODED_TO_GUITAR = {v: k for k, v in GUITAR_STRINGS_ENCODED.items()}

TYPE_BEATS = {
    'whole': 4,
    'half': 2,
    'quarter': 1,
    'eighth': 0.5,
    '16th': 0.25,
    '32nd': 0.125,
}

class Note:
    # the literal strings in the guitar
    GUITAR_STRINGS = [ 'E3', 'A3', 'D4', 'G4', 'B4', 'E5' ]
    
    @staticmethod
    def from_str(note_str: str) -> 'Note':
        return Note(note_str[0], int(note_str[1]))

    def __init__(self, step: str, octave: int, alter: int = 0):
        if step < 'A' or step > 'G':
            raise ValueError("Invalid note")
        self.step = step
        self.octave = octave
        self.alter = alter
        
    SEMITONES = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

    def _semitone(self):
        return self.octave * 12 + Note.SEMITONES[self.step] + self.alter

    def __eq__(self, other):
        return self._semitone() == other._semitone()

    def __lt__(self, other):
        return self._semitone() < other._semitone()
        
    def __le__(self, other):
        return self._semitone() <= other._semitone()

    def getFret(self) -> int | None:
        string = self.getString()
        if string is None:
            return None
        return self._semitone() - Note.from_str(string)._semitone()

    def getFretOnString(self, string_name: str) -> int | None:
        fret = self._semitone() - Note.from_str(string_name)._semitone()
        return fret if 0 <= fret <= 20 else None

    # string which note should be played on
    def getString(self) -> str | None:
        currStr = 0
        while currStr < len(Note.GUITAR_STRINGS) - 1 and self > Note.from_str(Note.GUITAR_STRINGS[currStr + 1]):
            currStr += 1

        fret = self._semitone() - Note.from_str(Note.GUITAR_STRINGS[currStr])._semitone()
        if fret < 0 or fret > 20:
            return None

        return Note.GUITAR_STRINGS[currStr]
       
     
class Song:
    def __init__(self, name: str, instrument: str, tempo: int, data: list, artist: str | None = None):
        self.name = name
        self.instrument = instrument
        self.tempo = tempo
        self.data = data
        self.artist = artist

    def to_json(self) -> str:
        return json.dumps({ 'name': self.name, 'instrument': self.instrument, 'bpm': self.tempo, 'notes': self.data })
    
# 
# output:
# {"bpm": float,
#     [
#         {
#           beat_time: int,
#           string: str,
#           fret: int,
#           slide_start?: true  -- this note slides into the next
#           slide_stop?: true   -- this note is the destination of a slide
#         },
#         ...
#     ]
# }
#
# beat_time is how many beats into the song when the note occurs
# string is one of 'E', 'A', 'D', 'G', 'B', 'E_HIGH'
# fret is from 0..=5
# cross-string slides are ignored


# returns [song_output, unplayable_note_count]
def parse_song(file: BytesIO, allow_unplayable: bool = False) -> tuple[Song, int]:
    # unzip
    xml = None
    try:
        with zipfile.ZipFile(file) as zf:
            # xml file is the last file in zip of .mxl zip file
            xml_name = zf.namelist()[-1]
            if not xml_name.endswith(".xml"):
                return ValueError("No XML file found")
            xml = zf.read(xml_name)
            
    except zipfile.BadZipfile:
        raise ValueError("Not in zip format")
    
    tree = ET.parse(BytesIO(xml))
    root = tree.getroot()
    
    if root.tag != "score-partwise":
        raise ValueError("Not partwise format")

    sound = root.find(".//sound[@tempo]")
    if sound is None:
        raise ValueError("No BPM found in file")
    bpm = round(float(sound.get("tempo")))  # type: ignore[arg-type]

    instrument = root.find(".//part-name").text # type: ignore[union-attr]
    movement_title = root.find("movement-title")
    work_title = root.find("work/work-title")
    name = (movement_title if movement_title is not None else work_title).text # type: ignore[union-attr]
    creator_el = root.find(".//identification/creator[@type='composer']")
    artist = creator_el.text.strip() if creator_el is not None and creator_el.text else None

    # time in score in beats
    curr_time = 0
    prev_beat_len = 0
    # the number of divisions in the current score part
    divisions = 1

    output = []
    skipped_notes = 0
    # maps slide/glissando number -> output index of the source note
    pending_slides: dict[str, int] = {}

    for measure in root.iter("measure"):
        divisions_el = measure.find("attributes/divisions")
        if divisions_el is not None and divisions_el.text is not None:
            divisions = int(divisions_el.text)

        for note in measure.findall("note"):
            is_chord = note.find("chord") is not None
            type_el = note.find("type")
            if type_el is not None and type_el.text is not None:
                duration = TYPE_BEATS.get(type_el.text, 0)
            else:
                dur_el = note.find("duration")
                duration = int(dur_el.text) / divisions if dur_el is not None and dur_el.text is not None else 0

            # rests advance time but produce no output
            if note.find("rest") is not None:
                if not is_chord:
                    curr_time += prev_beat_len
                    prev_beat_len = duration
                continue

            pitch = note.find("pitch")
            assert pitch is not None
            step = pitch.find("step").text  # type: ignore[union-attr]
            octave = int(pitch.find("octave").text)  # type: ignore[union-attr]
            assert step is not None
            alter_el = pitch.find("alter")
            alter = int(float(alter_el.text)) if alter_el is not None and alter_el.text is not None else 0

            if not is_chord:
                curr_time += prev_beat_len
                prev_beat_len = duration

            n = Note(step, octave, alter)
            if n.getString() is None:
                if allow_unplayable:
                    skipped_notes += 1
                    continue
                raise ValueError(f"Note {step}{octave} is outside playable range")

            encoded_string = GUITAR_STRINGS_ENCODED[n.getString()]  # type: ignore[index]

            # collect all slide/glissando stops and starts on this note
            is_grace = note.find("grace") is not None
            slide_stops = []
            slide_starts = []
            for tag in ("slide", "glissando"):
                for el in note.findall(f"notations/{tag}"):
                    num = el.get("number", "1")
                    if el.get("type") == "stop":
                        slide_stops.append(num)
                    elif el.get("type") == "start":
                        slide_starts.append(num)

            is_slide_stop = False
            forced_fret = None
            for num in slide_stops:
                if num in pending_slides:
                    src_idx = pending_slides.pop(num)
                    src = output[src_idx]
                    if src["string"] == encoded_string:
                        src["slide_start"] = True
                        is_slide_stop = True
                    else:
                        # destination is on a different string — try to force it onto source string
                        src_string_name = ENCODED_TO_GUITAR[src["string"]]
                        fret = n.getFretOnString(src_string_name)
                        if fret is not None:
                            encoded_string = src["string"]
                            forced_fret = fret
                            src["slide_start"] = True
                            is_slide_stop = True

            # grace notes act as slide sources but aren't real notes
            if is_grace:
                for num in slide_starts:
                    pending_slides[num] = len(output) - 1  # point to last real note as placeholder
                # skip adding grace note to output
                prev_beat_len = 0
                continue

            output_note = {
                'beat_time': curr_time,
                'string': encoded_string,
                'fret': forced_fret if forced_fret is not None else n.getFret(),
            }
            if is_slide_stop:
                output_note["slide_stop"] = True

            # register any starts on this note
            for num in slide_starts:
                pending_slides[num] = len(output)

            output.append(output_note)

    return Song(name, instrument, bpm, output, artist), skipped_notes


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python xml_parse.py <input.mxl> <output.json> [--allow-unplayable]")
        sys.exit(1)
    allow_unplayable = "--allow-unplayable" in sys.argv
    with open(sys.argv[1], "rb") as f:
        result, skipped_notes = parse_song(BytesIO(f.read()), allow_unplayable=allow_unplayable)
        warning = f"{skipped_notes} unplayable notes skipped" if skipped_notes else None
    if warning:
        print(f"Warning: {warning}")
    with open(sys.argv[2], "w") as f:
        f.write(result.to_json())
