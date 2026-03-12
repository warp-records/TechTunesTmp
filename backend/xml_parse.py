
import xml.etree.ElementTree as ET


# mapping to each string as encoded in the json
GUITAR_STRINGS_ENCODED = {
    'E3': 'E', 
    'A3': 'A',
    'D4': 'D',
    'G4': 'G',
    'B4': 'B',
    'E5': 'E_HIGH',
}

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

    # string which note should be played on
    def getString(self) -> str | None:
        currStr = 0
        while currStr < len(Note.GUITAR_STRINGS) - 1 and self > Note.from_str(Note.GUITAR_STRINGS[currStr + 1]):
            currStr += 1

        fret = self._semitone() - Note.from_str(Note.GUITAR_STRINGS[currStr])._semitone()
        if fret < 0 or fret > 5:
            return None

        return Note.GUITAR_STRINGS[currStr]
        
# 
# output:
# [{ beat_time, string, fret }]
# beat_time is how many beats into the song when the note occurs
# string is one of 'E', 'A', 'D', 'G', 'B', 'E_HIGH'
# E3, A3, D4, G4, B4, E5
# fret is from 0..=5
def parse_song(filename: str):
    tree = ET.parse(filename)
    root = tree.getroot()
    
    if root.tag != "score-partwise":
        raise ValueError("Score must be partwise")
        
    curr_time = 0
    prev_beat_len = 0
    
    output = []
    
    notes = list(root.iter("note"))
    for note in notes:
        is_chord = note.find("chord") is not None
        type_el = note.find("type")
        duration = TYPE_BEATS.get(type_el.text, 0) if type_el is not None and type_el.text is not None else 0

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
            raise ValueError(f"Note {step}{octave} is outside playable range")
        output_note = {
            'beat_time': curr_time,
            'string': GUITAR_STRINGS_ENCODED[n.getString()],  # type: ignore[index]
            'fret': n.getFret(),
        }
        output.append(output_note)

    return output


print(parse_song("assets/songs/happy_birthday.xml"))