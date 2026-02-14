import './Username.css'

const defaultSuggestions = ['MusicMaster', 'GuitarHero', 'PickBotFan', 'RockStar', 'MelodyMaker']

export default function Username({ suggestions = defaultSuggestions }) {
  return (
    <main className="main-container">
      <div className="username-container">
        <h1 className="username-title">Create Your Username</h1>
        <p className="username-subtitle">Choose a unique username that represents your musical journey!</p>

        <div className="username-input-container">
          <input
            type="text"
            className="username-input"
            placeholder="Enter your username..."
            maxLength="20"
            autoComplete="off"
          />
        </div>

        <div className="username-suggestions">
          {suggestions.map((name) => (
            <button key={name} className="suggestion-btn">{name}</button>
          ))}
        </div>

        <button className="username-continue-btn">
          Continue to PickBot Creation
        </button>
      </div>
    </main>
  )
}
