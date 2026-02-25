
import { useState } from 'react';

import Pickbot, { Dialogue } from '../../components/Pickbot.jsx'
import './Onboard.css'
import './Select.css'
import './RectSelect.css'
import { useEffect } from 'react';

const numPages = 6;

/**
 * Multi-step onboarding route.
 *
 * @returns {JSX.Element}
 */
export default function Onboard() {
  const [progIdx, setProgIdx] = useState(0);
  
  /** @type {[OnboardData, import('react').Dispatch<import('react').SetStateAction<OnboardData>>]} */
  const [onboardData, setOnboardData] = useState(() => {
    const saved = localStorage.getItem("onboardData");
    return saved ? JSON.parse(saved) : {
      "skill": null,
      "guitarType": null,
      "useCase": [],
      "genres": [],
    }
  });
  
  useEffect(() => {
    localStorage.setItem("onboardData", JSON.stringify(onboardData));
  }, [onboardData])
  
  /**
   * Applies selection updates for either single or multi select forms.
   *
   * @param {'skill'|'guitarType'|'useCase'|'genres'} formName
   * @param {number} option Option index.
   * @param {boolean} multiSelect Whether the field allows multiple values.
   * @returns {void}
   */
  function handleClick(formName, option, multiSelect) {
    setOnboardData(prev => {
      const next = { ...prev };
      if (multiSelect) {
        const arr = [...(prev[formName] || [])];
        const idx = arr.indexOf(option);
        if (idx === -1) {
          arr.push(option);
        } else {
          arr.splice(idx, 1);
        }
        next[formName] = arr;
      } else {
        next[formName] = prev[formName] !== option ? option : null;
      }
      
      return next;
    });
  }
  
  /**
   * Advances to next onboarding step or navigates to pricing on completion.
   *
   * @returns {void}
   */
  function handleContinue() {
    
    if (progIdx == numPages-1) {
      window.open('/pricing', '_self');
    } else {
      setProgIdx(progIdx + 1);
    }
  }
  
  const pickBotDialogue = [
    "Hi! I'm PickBot, your musical companion!",
    "I'm always here to jam with you! Let's get rocking and make some beautiful music together!",
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
    "What's your currnet guitar skill level?",
    "What type of guitar are you learning on?",
    "What are you planning to use Tech Tunes for the most?",
    "Choose as many genres as you like:",
  ];
  
  return (
    <>
      <div className="onboard-root">
        <main className="main-container">
          <div class="registration-card">
            <div class="character-section">
            <Pickbot />
            <Dialogue text={pickBotDialogue[progIdx]} />
            <QuestionTitle text={questTitle[progIdx]} />
            </div>
          
            {progIdx === 2 && <ListSelect formName={"skill"} options={skillOptions} multiSelect={false} handleClick={handleClick} />}
            {progIdx === 3 && <RectSelect formName={"guitarType"} options={guitarTypes} emojis={guitarEmojis} descriptions={[]} multiSelect={false} handleClick={handleClick} />}
            {progIdx === 4 && <ListSelect formName={"useCase"} options={useCases} multiSelect={true} handleClick={handleClick} />}
            {progIdx === 5 && <RectSelect formName={"genres"} options={genres} emojis={genreEmojis} descriptions={genreDescs} multiSelect={true} handleClick={handleClick} />}
          
            <ProgressDots pos={progIdx} />
            <div class="continue-section">
            
              <ContinueBtn text={continueBtnText} onContinue={handleContinue} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

/**
 * Continue button for onboarding progression.
 *
 * @returns {JSX.Element}
 */
function ContinueBtn({ text, onContinue }) {
  return (
    <button class="continue-btn" id="continue-btn" onClick={onContinue}>{text}</button>
  )
}


/**
 * Renders progress dots for each onboarding page.
 *
 * @param {Object} props
 * @param {number} props.pos Active page index.
 * @returns {JSX.Element}
 */
function ProgressDots({ pos }) {
  let dots = []
  for (let i = 0; i < numPages; i++) {
    dots.push(
      <div key={i} className={`progress-dot ${ i == pos ? 'active' : ''}`}></div> 
    )
  }
  
  return (
    <div className="progress-indicator">{dots}</div>
  )
}

/**
 * Displays current onboarding question title.
 *
 * @param {Object} props
 * @param {string} props.text Title text.
 * @returns {JSX.Element}
 */
function QuestionTitle({ text }) {
  return (<h2 class="question-title">{text}</h2>)
}

/**
 * Vertical list selector for single/multi select questions.
 * 
 * @returns {JSX.Element}
 */
function ListSelect({ formName, options, multiSelect, handleClick }) {
  const items = options.map((option, idx) =>
    <div class="skill-option" key={idx}>
      <input type={multiSelect ? 'checkbox' : 'radio'} name="skillLevel" id={`skill-${idx}`} onChange={() => handleClick(formName, idx, multiSelect)} />
      <label htmlFor={`skill-${idx}`} className={`skill-label${multiSelect ? ' has-checkbox' : ''}`}>
        {multiSelect && (
          <div className="custom-checkbox">
            <svg className="checkmark" viewBox="0 0 24 24">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        )}
        <div>{option}</div>
      </label>
    </div>
  );
  
  return (
    <div class="skill-options">
      {items}
    </div>
  )
}

/**
 * Grid selector used for guitar type and genre questions.
 *
 * @returns {JSX.Element}
 */
function RectSelect({ formName, options, emojis, descriptions, multiSelect, handleClick }) {
  const items = options.map((option, idx) =>
    <div class="guitar-option" key={idx}>
      <input type={multiSelect ? 'checkbox' : 'radio'} name="rectSelect" id={`rect-${idx}`} value={option} />
      <label htmlFor={`rect-${idx}`} class="guitar-label" onClick={() => handleClick(formName, idx, multiSelect)}>
        <div class="guitar-icon">{emojis[idx]}</div>
        <div>{option}</div>
        <div class="genre-desc">{descriptions[idx]}</div>
      </label>
    </div>
  );
  
  return (
    <div class="guitar-options">
      {items}
    </div>);
}
