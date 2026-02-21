import { useState } from 'react'
import { Route, Link } from 'react-router-dom'
import './Username.css'
import { useEffect } from 'react';

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
  const validName = username.length >= 3;
 
  let suggestions = [...allSuggestions].sort(() => 0.5 - Math.random());
  suggestions = suggestions.slice(0, 5);
  
  function handleInput(e) {
    setUsername(e.target.value);
  }
  
  useEffect(() => {
    localStorage.setItem("username", username);
  }, [username]);
  
  
  return (
    <main className="main-container">
      <div className="username-container">
        <h1 className="username-title">Create Your Username</h1>
        <p className="username-subtitle">Choose a unique username that represents your musical journey!</p>

        <div className={`username-input-container`}>
          <input
            type="text"
            class={`username-input ${username && !validName ? 'bad-input' : ''}`}
            placeholder="Enter your username..."
            maxLength="20"
            autoComplete="off"
            value={username}
            onChange={handleInput}
          />
          {username && !validName ?
            (<div class="error-message">Username must be at least 3 characters long</div>) : (<></>)
          }
        </div>

        <div className="username-suggestions">
          {suggestions.map((name) => (
            <button key={name} className="suggestion-btn" onClick={() => setUsername(name)}>{name}</button>
          ))}
        </div>

        <Link to="/create">
          <button className="username-continue-btn" disabled={!validName}>
            Continue to PickBot Creation
          </button>
        </Link>
      </div>
    </main>
  )
}
