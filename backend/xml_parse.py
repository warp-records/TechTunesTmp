
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

# output:
# [{ beat_time, string, fret }]
# beat_time is how many beats into the song when the note occurs
# string is one of 'E', 'A', 'D', 'G', 'B', 'E_HIGH'
# E3, A3, D4, G4, B4, E5
# fret is from 0..=5
class Note:
    # the literal strings in the guitar
    GUITAR_STRINGS = [ 'E3', 'A3', 'D4', 'G4', 'B4', 'E5' ]
    
    def __init__(self, note_str):
        self.step = note_str[0]
        self.octave = int(note_str[1])
        
    def __eq__(self, other):
        return self.octave == other.octave and self.step == other.step
        
    def __lt__(self, other):
        selfIdx = self.octave * 8 + ord(self.step) - ord('A')
        otherIdx = other.octave * 8 + ord(other.step) - ord('A')
        
        return selfIdx < otherIdx
    
    # string which note should be played on
    def getString(self) -> str | None:
        currStr = 0
        while self < Note(Note.GUITAR_STRINGS[currStr]) and currStr < len(Note.GUITAR_STRINGS):
            currStr += 1
        
        if currStr == len(Note.GUITAR_STRINGS):
            return None
            
        return Note.GUITAR_STRINGS[currStr]
        

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
        pitch = note.find("pitch") or ''
        step = pitch.find("step").text  # type: ignore[union-attr]
        octave = int(pitch.find("octave").text)  # type: ignore[union-attr]
        assert step is not None and octave is not None

        if step < 'A' or step > 'G':
            raise ValueError("Invalid note")
            
        if (step < 'E' and octave < 3) or octave > 5:
            raise ValueError("Outside playable range")
        
        step_num = ord(step) - ord('A')
        
        output_note = {
            
        }
        
        # last note in each chord has a </chord> tag
        if note.find("chord") is not None:
            duration = note.find("")
        
    


parse_song("assets/songs/happy_birthday.xml")