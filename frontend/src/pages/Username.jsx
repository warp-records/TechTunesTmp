import { useState } from 'react'
import { Route, Link, useNavigate } from 'react-router-dom'
import './Username.css'
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

export default function Username() {
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
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
      }
    )
    
    const data = await response.json();
    if (response.ok) {
      navigate('/create');
    }
  }
  
  
  useEffect(() => {
    localStorage.setItem("username", username);
  }, [username]);
  
  
  return (
    <main className="main-container">
      <div className="username-container">
        <h1 className="username-title">Create Your Username</h1>
        <p className="username-subtitle">Choose a unique username that represents your musical journey!</p>

        <div className={`field-input-container`}>
          <input
            type="text"
            class={`field-input ${username && (!validName || usernameTaken) ? 'bad-input' : ''}`}
            placeholder="Enter your username..."
            maxLength="20"
            autoComplete="off"
            value={username}
            onChange={handleInput}
          />
          {username && !validName &&
            <div class="error-message">Username must be at least 3 characters long</div>
          }
          {username && validName && usernameTaken &&
            <div class="error-message">Username is taken</div>
          }
        </div>
        
  
        <div className="username-suggestions">
          {suggestions.map((name) => (
            <button key={name} className="suggestion-btn" onClick={() => {
              setUsername(name);
              setSuggestions(randSuggestions());
            }}>{name}</button>
          ))}
        </div>

        <br></br>
        
        <p className="username-subtitle">Password</p>
        <div className={`input-container`}>
          <input
            class={`field-input ${password && !isGoodPassword() ? 'bad-input' : ''}`}
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            autoComplete="off"
            value={password}
            onChange={handlePassInput}
          ></input>
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
        </div>
        {password && !isGoodPassword() ?
          (<div class="error-message">Password needs 10+ characters, uppercase, lowercase, and 2 numbers or 1 special character</div>) : (<></>)
        }
        
        {/* <Link to="/create">*/}
          <button onClick={register} className="username-continue-btn" disabled={!validName || !isGoodPassword() || usernameTaken}>
            Continue to PickBot Creation
          </button>
        {/* </Link>*/}
      </div>
    </main>
  )
}
