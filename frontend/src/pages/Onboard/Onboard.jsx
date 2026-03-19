
import { useState } from 'react';

import Pickbot, { Dialogue } from '../../components/Pickbot.jsx'
import onboardStyles from './Onboard.module.css'
import selectStyles from './Select.module.css'
import rectSelectStyles from './RectSelect.module.css'
import { useEffect } from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';


const numPages = 7;

export default function Onboard() {
  const [progIdx, setProgIdx] = useState(0);
  const [calView, setCalView] = useState('month');

  const [canContinue, setCanContinue] = useState(true);

  const [onboardData, setOnboardData] = useState(() => {
    const saved = localStorage.getItem("onboardData");
    return saved ? JSON.parse(saved) : {
      "dob": null,
      "skill": null,
      "guitarType": null,
      "useCase": [],
      "genres": [],
    }
  });

  const date = onboardData.dob ? new Date(onboardData.dob) : null;

  useEffect(() => {
    const { dob, ...rest } = onboardData;
    localStorage.setItem("onboardData", JSON.stringify(rest));
  }, [onboardData])
  
  function handleClick(formName, option, multiSelect) {
    const next = { ...onboardData };
    if (multiSelect) {
      const arr = [...(onboardData[formName] || [])];
      const idx = arr.indexOf(option);
      if (idx === -1) arr.push(option);
      else arr.splice(idx, 1);
      next[formName] = arr;
    } else {
      next[formName] = onboardData[formName] !== option ? option : null;
    }
    setOnboardData(next);

    if (progIdx === 3) setCanContinue(next.skill !== null);
    if (progIdx === 4) setCanContinue(next.guitarType !== null);
    if (progIdx === 5) setCanContinue(next.useCase.length > 0);
    
  }
  
  function checkCanContinue() {
    if (progIdx < 2) return true;
    if (progIdx == 2) return onboardData.dob != null;
    if (progIdx == 3) return onboardData.skill != null;
    if (progIdx == 4) return onboardData.guitarType != null;
    if (progIdx == 5) return onboardData.useCase.length > 0;
    return true;
  }
  
  useEffect(() => {
    setCanContinue(checkCanContinue());
  }, [progIdx])
  
  
  function handleContinue() {
    if (progIdx === 2 && onboardData.dob) {
      const dob = new Date(onboardData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
      localStorage.setItem("underAge", age < 13 ? "true" : "false");
    }

    if (progIdx == numPages-1) {
      const dest = localStorage.getItem("underAge") === "true" ? '/parent_permission' : '/pricing';
      window.open(dest, '_self');
    } else {
      setProgIdx(progIdx + 1);
    }
  }
  
  const pickBotDialogue = [
    "Hi! I'm PickBot, your musical companion!",
    "I'm always here to jam with you! Let's get rocking and make some beautiful music together!",
    "What is your date of birth?",
    "NO SHAME IN STARTING FROM SCRATCH - I GOT YOU!",
    "GREAT CHOICE! NOW LET'S PICK YOUR GUITAR!",
    "GREAT CHOICE! ANYTHING ELSE?",
    "ONE LAST THING - WHAT MUSIC DO YOU LOVE MOST?",
  ]
  
  let continueBtnText = ""
  if (progIdx == 0) {
    continueBtnText = "Let's Start!"
  } else if (progIdx == 1) {
    continueBtnText = "Awesome!"
  } else if (progIdx == 5) {
    continueBtnText = "Finish"
  } else {
    continueBtnText = "Continue"
  }
  
  let skillOptions = [
    "I've never picked up a guitar (Beginner)",
    "I know most chords/tabs (Medium)",
    "I can play difficult songs (Hard)",
    "I'm Advanced but want to keep growing (Expert)",
  ]
  
  const guitarTypes = [
    "Acoustic",
    "Electric",
    "Both",
    "Not Sure Yet",
  ]
  
  const guitarEmojis = [
    '🎸',
    '⚡',
    '🎵',
    '🤔',
  ]
  
  const genres = [
    "Rock",
    "Pop",
    "R & B / Soul",
    "Indie / Folk",
    "Country",
    "Hip - Hop",
    "Jazz",
    "Classical",
    "Electronic",
    "Metal",
    "Reggae",
    "Blues",
    "Latin",
    "A Mix of Everything",
  ]

  const genreDescs = [
    "Classic & Modern",
    "Chart Toppers",
    "Smooth Grooves",
    "Alternative Vibes",
    "Stories & Heart",
    "Beats & Rhymes",
    "Smooth & Improvised",
    "Orchestral & Elegant",
    "Synth & Dance",
    "Heavy & Loud",
    "Roots & Vibes",
    "Soulful & Raw",
    "Rhythmic & Festive",
    "All Genres",
  ]

  const genreEmojis = [
    "🎸", "🎤", "🎵", "🎶", "🤠",
    "🎧", "🎷", "🎻", "🎛️", "🤘",
    "🇯🇲", "🎹", "🥁", "🌟",
  ]
  
  
  let useCases = [
    "A personalized library of songs that match my skill level",
    "Gamified lessons & challenges",
    "Progress tracking - So I can see how far I've come",
    "Just here for sheet music, I don't need lessons",
  ]
  
  const questTitle = [
    "",
    "",
    "Enter date of birth:",
    "What's your currnet guitar skill level?",
    "What type of guitar are you learning on?",
    "What are you planning to use Tech Tunes for the most?",
    "Choose as many genres as you like:",
  ];
  
  return (
    <>
      <div className={onboardStyles['onboard-root']}>
        <main className={onboardStyles['main-container']}>
          <div className={onboardStyles['registration-card']}>
            <div className={onboardStyles['character-section']}>
            <Pickbot />
            <Dialogue text={pickBotDialogue[progIdx]} />
            <QuestionTitle text={questTitle[progIdx]} />
            </div>
          
            {progIdx === 2 &&
              <div className={[onboardStyles['date-picker-wrapper'], calView === 'year' ? onboardStyles['cal-month-view'] : ''].filter(Boolean).join(' ')}>
                <DatePicker onChange={(val) => { setOnboardData(prev => ({ ...prev, dob: val ? val.toISOString() : null })); setCanContinue(val != null); }} value={date} maxDate={new Date()} maxDetail={"month"} calendarProps={{
                  onViewChange: ({ view }) => {
                    setCalView(view)
                    console.log(date)
                    
                  }
                }} />
              </div>
            }
            {progIdx === 3 && <ListSelect formName={"skill"} options={skillOptions} multiSelect={false} handleClick={handleClick} selected={onboardData.skill} />}
            {progIdx === 4 && <RectSelect formName={"guitarType"} options={guitarTypes} emojis={guitarEmojis} descriptions={[]} multiSelect={false} handleClick={handleClick} selected={onboardData.guitarType} />}
            {progIdx === 5 && <ListSelect formName={"useCase"} options={useCases} multiSelect={true} handleClick={handleClick} selected={onboardData.useCase} />}
            {progIdx === 6 && <RectSelect formName={"genres"} options={genres} emojis={genreEmojis} descriptions={genreDescs} multiSelect={true} handleClick={handleClick} selected={onboardData.genres} />}
          
            <ProgressDots pos={progIdx} />
            <div className={onboardStyles['continue-section']}>

              <ContinueBtn text={continueBtnText} onContinue={handleContinue} disabled={!canContinue} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

function ContinueBtn({ text, onContinue, disabled }) {
  return (
    <button className={onboardStyles['continue-btn']} id="continue-btn" onClick={onContinue} disabled={disabled}>{text}</button>
  )
}


function ProgressDots({ pos }) {
  let dots = []
  for (let i = 0; i < numPages; i++) {
    dots.push(
      <div key={i} className={[onboardStyles['progress-dot'], i == pos ? onboardStyles['active'] : ''].filter(Boolean).join(' ')}></div>
    )
  }
  
  return (
    <div className={onboardStyles['progress-indicator']}>{dots}</div>
  )
}

function QuestionTitle({ text }) {
  return (<h2 className={onboardStyles['question-title']}>{text}</h2>)
}

function ListSelect({ formName, options, multiSelect, handleClick, selected }) {
  const items = options.map((option, idx) => {
    const isChecked = multiSelect ? (selected || []).includes(idx) : selected === idx;
    return <div className={selectStyles['skill-option']} key={idx}>
      <input type={multiSelect ? 'checkbox' : 'radio'} name="skillLevel" id={`skill-${idx}`} checked={isChecked} onChange={() => handleClick(formName, idx, multiSelect)} />
      <label htmlFor={`skill-${idx}`} className={[selectStyles['skill-label'], multiSelect ? selectStyles['has-checkbox'] : ''].filter(Boolean).join(' ')}>
        {multiSelect && (
          <div className={selectStyles['custom-checkbox']}>
            <svg className={selectStyles['checkmark']} viewBox="0 0 24 24">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        )}
        <div>{option}</div>
      </label>
    </div>;
  });

  return (
    <div className={selectStyles['skill-options']}>
      {items}
    </div>
  )
}

function RectSelect({ formName, options, emojis, descriptions, multiSelect, handleClick, selected }) {
  const items = options.map((option, idx) => {
    const isChecked = multiSelect ? (selected || []).includes(idx) : selected === idx;
    return <div className={rectSelectStyles['guitar-option']} key={idx}>
      <input type={multiSelect ? 'checkbox' : 'radio'} name="rectSelect" id={`rect-${idx}`} value={option} checked={isChecked} onChange={() => handleClick(formName, idx, multiSelect)} />
      <label htmlFor={`rect-${idx}`} className={rectSelectStyles['guitar-label']}>
        <div className={rectSelectStyles['guitar-icon']}>{emojis[idx]}</div>
        <div>{option}</div>
        <div className={rectSelectStyles['genre-desc']}>{descriptions[idx]}</div>
      </label>
    </div>;
  });

  return (
    <div className={rectSelectStyles['guitar-options']}>
      {items}
    </div>);
}
