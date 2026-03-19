import { useState } from 'react'
import { Route, Link, useNavigate } from 'react-router-dom'
import styles from './AccountCreate.module.css'
import { useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const allSuggestions = [
  "RhythmQuest", "MelodyMaster", "TempoTrainer", "HarmonyHero", "NoteNinja", "ScaleSprint",
  "ChordChampion", "BeatBuilder", "PitchPilot", "SonicScholar", "TrebleTrials", "BassBoss",
  "KeyKingdom", "IntervalIsland", "RhythmRanger", "MelodyMaze", "TempoTactician", "HarmonyHaven",
  "NoteNavigator", "ScaleSaga", "ChordCrafter", "BeatBattles", "PitchPioneer", "SonicSprint",
  "TrebleTrainer", "BassBattalion", "KeyCraze", "IntervalImpact", "RhythmRealm", "MelodyMission",
  "TempoTower", "HarmonyHub", "NoteQuest", "ScaleStorm", "ChordCastle", "BeatBlitz",
  "PitchPath", "SonicSymphony", "TrebleTrek", "BassBridge", "KeyKnights", "IntervalInfinity",
  "RhythmRise", "MelodyMatrix", "TempoTrail", "MusicMaster", "GuitarHero", "PickBotFan", "RockStar",
  "MelodyMaker"
];


// const defaultSuggestions = ["MusicMaster", "GuitarHero", "PickBotFan", "RockStar", "MelodyMaker"]

export default function AccountCreate() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [suggestions, setSuggestions] = useState(randSuggestions());
  const [usernameTaken, setUsernameTaken] = useState(false);
  
  const validName = username.length >= 3;
  
  useEffect(() => {
    if (!validName) return;
    
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/check-username/${username}`);
      const data = await res.json();
      
      setUsernameTaken(data.taken);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [username]);
  
  
  function randSuggestions() {
    let suggestions = [...allSuggestions].sort(() => 0.5 - Math.random());
    return suggestions.slice(0, 5);
  }
  
  function handleInput(e) {
    setUsername(e.target.value);
  }
  
  function handlePassInput(e) {
    setPassword(e.target.value);
  }
  
  // 10 characters long
  // one uppercase
  // one lowercase
  // two digits OR one special character
  function isGoodPassword() {
    if (password.length < 10) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    const digitCount = (password.match(/[0-9]/g) || []).length;
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (digitCount < 2 && !hasSpecial) return false;
    return true;
  }
  
  const navigate = useNavigate();
  
  async function register() {
    const underage = localStorage.getItem("underAge") === "true";

    const response = await fetch(`/api/register?underage=${underage}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
      }
    )

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token)
      setTimeout(() => navigate(underage ? '/parent_permission' : '/pickbot_edit'), 1000);
    }
  }
  
  
  useEffect(() => {
    localStorage.setItem("username", username);
  }, [username]);
  
  
  return (
    <main className={styles['main-container']}>
      <div className={styles['username-container']}>
        <h1 className={styles['username-title']}>Create Your Username</h1>
        <p className={styles['username-subtitle']}>Choose a unique username that represents your musical journey!</p>

        <div className={styles['field-input-container']}>
          <input
            type="text"
            className={[styles['field-input'], username && (!validName || usernameTaken) ? styles['bad-input'] : ''].filter(Boolean).join(' ')}
            placeholder="Enter your username..."
            maxLength="20"
            autoComplete="off"
            value={username}
            onChange={handleInput}
          />
          {username && !validName &&
            <div className={styles['error-message']}>Username must be at least 3 characters long</div>
          }
          {username && validName && usernameTaken &&
            <div className={styles['error-message']}>Username is taken</div>
          }
        </div>
        
  
        <div className={styles['username-suggestions']}>
          {suggestions.map((name) => (
            <button key={name} className={styles['suggestion-btn']} onClick={() => {
              setUsername(name);
              setSuggestions(randSuggestions());
            }}>{name}</button>
          ))}
        </div>

        <br></br>
        
        <p className={styles['username-subtitle']}>Password</p>
        <div className={styles['input-container']}>
          <input
            className={[styles['field-input'], password && !isGoodPassword() ? styles['bad-input'] : ''].filter(Boolean).join(' ')}
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            autoComplete="off"
            value={password}
            onChange={handlePassInput}
          ></input>
          <button
            type="button"
            className={styles['toggle-password-btn']}
            onClick={() => setShowPassword(!showPassword)}
          >{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
        </div>
        {password && !isGoodPassword() ?
          (<div className={styles['error-message']}>Password needs 10+ characters, uppercase, lowercase, and 2 numbers or 1 special character</div>) : (<></>)
        }
        
          <button onClick={register} className={styles['username-continue-btn']} disabled={!validName || !isGoodPassword() || usernameTaken}>
            Continue to PickBot Creation
          </button>
      </div>
    </main>
  )
}
