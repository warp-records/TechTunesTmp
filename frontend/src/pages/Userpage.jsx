
import Avatar from "../components/Avatar"
import "./Userpage.css"

const suggestedSongs = [
  { title: "Get Got", subtitle: "Death Grips", stars: 5, },
  { title: "Tout Naturel", subtitle: "Lucy Bedroque", stars: 4, },
  { title: "Bloody Mary", subtitle: "SpaceGhostPurrp", stars: 3, },
  { title: "Radiation", subtitle: "Lil Ugly Mane", stars: 4, },
  { title: "Excursions", subtitle: "A Tribe Called Quest", stars: 2, },
]

const songBook = [
  { title: "Kendo Thugs", subtitle: "Yabujin", stars: 3, },
  { title: "DIAMONDHEAD", subtitle: "JoeB", stars: 5, },
  { title: "Clipper", subtitle: "Autechre", stars: 4, },
  { title: "TANK", subtitle: "Space Laces", stars: 5, },
  { title: "Sevntrack", subtitle: "Speedy J", stars: 4, },
]

const spotifySongs = [
  { title: "Slowly", subtitle: "Amon Tobin", stars: 4, },
  { title: "Sunshine Recorder", subtitle: "Boards of Canada", stars: 3, },
  { title: "Slowly", subtitle: "Amon Tobin", stars: 3, },
  { title: "Lost In Dreams 19", subtitle: "Irini", stars: 4, },
  { title: "Lick The Rainbow", subtitle: "Mord Fustang", stars: 5, },
  { title: "Blue", subtitle: "Au5", stars: 4, },
]

const genres = [
  { title: "Hip-Hop", subtitle: "", stars: 5, },
  { title: "IDM", subtitle: "", stars: 4, },
  { title: "Techno", subtitle: "", stars: 5, },
  { title: "Dariacore", subtitle: "", stars: 3, },
  { title: "Avante-garde", subtitle: "", stars: 4, },
]


export default function Userpage() {
  
  const username = "Kyri";
  
  const friends = [
    { "name": "Alexa", "online": true, },
    { "name": "Alex", "online": false, },
    { "name": "Ethan", "online": true, },
    { "name": "Max", "online": false, }
  ]
  
  const leaderboard = [
    { "name": "Alexa", "song": "Sweet Child O' Mine", score: 1000 },
    { "name": "Ethan", "song": "Mean Mr Mustard", score: 850 },
    { "name": "Max", "song": "I'm The Problem", score: 700 },
  ]
  
  const avatarJson = {
    "form": 0,
    "color": "#8A2BE2",
    "activeItems": {
      "eye": "Eyeliner Eyes",
      "mouth": "Lips Mouth",
      "accessory": { "name": "Bow", "x": -27, "y": 45 }
    }
  };
  
  return (
  <>
    
    
  <main class="container">
    <section id="avatar" aria-labelledby="avatar-title">
        <div class="avatar-welcome">
          <h2 id="avatar-title" class="avatar-welcome-title">Welcome to TuneVerse</h2>
          <div id="pickbot-speech-bubble">
              Hello, <span id="username-display">{username}</span>!
                </div>
                
              <div id="userpage-avatar">
                <Avatar form={avatarJson["form"]} activeItems={avatarJson["activeItems"]} color={avatarJson["color"]} />
              </div>
        </div>
      </section>
        
    <section id="lessons" aria-labelledby="lessons-title">
      <h3 class="section-title">Lesson Island</h3>
      <div class="grid">
        <LessonCard 
        instrument={"Guitar"}
        emoji={"🎸"}
        completed={10}
        total={25}
        />
        
        <LessonCard 
        instrument={"Piano"}
        emoji={"🎹"}
        completed={2}
        total={25}
        />
        
        <LessonCard 
        instrument={"Drums"}
        emoji={"🥁"}
        completed={15}
        total={25}
        />
      </div>
    </section>
    
        <SongRow title={"Suggested Songs (by Skill Level)"} songs={suggestedSongs} />
        <SongRow title={"SongBook"} songs={songBook} />
        
        <section id="friends">
          <h3 class="section-title" id="friends-title">Friends</h3>
          <div class="friends-wrap">
            {
              friends.map((friend, index) => {
                return <Friend key={index} name={friend["name"]} isOnline={friend["online"]} />
              })
          }
          
            <div class="friend">
              <div class="pfp" aria-hidden="true">+</div>
                <div>More Friends</div>
              </div>
            </div>
            
        </section>
        
        <section id="leaderboard" aria-labelledby="leaderboard-title">
          <h3 class="section-title" id="leaderboard-title">Leaderboard</h3>
          <div class="grid">
            {
              leaderboard.map((entry, index) => {
                return <LeaderBoardCard friend={entry["name"]} song={entry["song"]} score={entry["score"]} />
              })
            }
          </div>
        </section>
        
        <SongRow title={"Songs from Spotify"} songs={spotifySongs} />
        <SongRow title={"Pick Your Genre"} songs={genres} />
        
  </main>
  </>
  )
}

// progress as 
export function LessonCard({ instrument, emoji, completed, total }) {
  
  return (
    <div class="lesson-card card">
      <h4>{emoji} {instrument}</h4>
      <div class="progress"><span style={{width: `${completed/total*100}%`}}></span></div>
      <div class="tiny">{completed} / {total} lessons</div>
      <div style={{ marginTop: '16px' }}><a href="" className="chip">Continue {instrument}</a></div>
    </div>
  )
}

// songs: [
//   {
//     "title": string,
//     "subtitle": string,
//     "stars": int,
//   }
// ]
export function SongRow({ title, songs }) {
  
  return (
    <section>
      <h3 class="section-title" id="suggested-title">{title}</h3>
      <div class="row card">
        <div class="arrow left" data-arrow="left" data-row="suggested" tabindex="0" aria-label="Scroll left">‹</div>
        <div class="row-track" id="row-suggested">
          {
            songs.map(song => <SongTile
              title={song["title"]}
              subtitle={song["subtitle"]}
              stars={song["stars"]} />)
          }
        </div>
        <div class="arrow right" data-arrow="right" data-row="suggested" tabindex="0" aria-label="Scroll right">›</div>
      </div>
    </section>
  )
}

export function SongTile({ title, subtitle, stars }) {
  return (
    <div class="tile">
      <div class="meta">{title}</div>
      <div class="sub">{subtitle}</div>
      <div class="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < stars ? '★' : '☆'}</span>
        ))}
      </div>
    </div>
  )
}

export function Friend({ name, isOnline }) {
  return (
    <>
      <div class="friend">
        <div class="pfp">{name[0].toUpperCase()}</div>
        <div>{name}</div>
        <div className={`status ${ isOnline ? 'online' : 'offline'} `}>{ isOnline ? 'Online' : 'Offline'}</div>
      </div>
    </>
  )
}

export function LeaderBoardCard({ friend, song, score }) {
  return (
    <div class="lb card">
      <strong>{friend}</strong> —
      <span class="tiny">{song}</span>
      <div style={{ "marginTop": "8px" }}>
        Score: <strong>{score}</strong>
      </div>
    </div>
  )
}