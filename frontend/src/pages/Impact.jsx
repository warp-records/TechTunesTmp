import './Impact.css'
import HomeButton from '../components/HomeButton'

export default function Impact() {
  return (
    <div className="impact-root">
      <HomeButton />
      <header className="impact-header">
        <h1 className="impact-title">IMPACT PAGE</h1>
      </header>

      <main className="impact-page" aria-labelledby="page-title">
        <div className="region-select">
          <button
            id="philly-btn"
            className="region-btn"
            type="button"
            aria-haspopup="listbox"
            aria-expanded="false"
            aria-controls="philly-menu"
          >
            <span>Philadelphia</span>
            <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ProgramCard
          title="Musicopia"
          desc="We partner with the Musicopia Foundation to help 51 schools in Philadelphia that 
          don't have access to music education, to provide them with the tools and resources they 
          need to succeed. Let's change that!"
          buttons={[
            [
              "Donate Instruments",
              "https://www.musicopia.net/instrument-donation-form",
            ],
            ["Volunteer", "https://www.musicopia.net/volunteer"],
            [
              "Donate Money",
              "https://secure.givelively.org/donate/musicopia-inc",
            ],
            ["How much we raised so far", null],
          ]}
        />

        <ProgramCard
          title="Generation Music"
          desc="A fun program in Philly where kids and teens can learn, play, and share their music with others."
          buttons={[
            ["Support Us", "https://www.generationmusic.art/support-us"],
            ["Get Involved", "https://www.generationmusic.art/get-involved-1"],
            ["Learn More", "https://www.generationmusic.art"],
            ["How much we raised so far", null],
          ]}
        />

        <ProgramCard
          title="Philadelphia Chamber Music Society"
          desc="PCMS brings world-class chamber music to Philadelphia, fostering appreciation for classical music through concerts, education, and community engagement."
          buttons={[
            ["Learn More", "https://www.pcmsconcerts.org/about/"],
            ["Donate", "https://www.pcmsconcerts.org/support/secure-donation/"],
            ["Fund", "https://www.pcmsconcerts.org/support/fund/"],
            ["How much we raised so far", null],
          ]}
        />

        <ProgramCard
          title="Play On Philly"
          desc="A free program that helps kids learn instruments every day and grow through music."
          buttons={[
            ["Learn More", "https://playonphilly.org/"],
            ["Donate", "https://playonphilly.org/get-involved/donate/"],
            [
              "Donate Instruments",
              "https://playonphilly.org/get-involved/instrument-donations/",
            ],
            ["How much we raised so far", null],
          ]}
        />

        <div className="region-select">
          <button
            className="region-btn disabled"
            type="button"
            aria-disabled="true"
            title="Coming soon"
          >
            <span>New Jersey</span>
            <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              ></path>
            </svg>
          </button>
        </div>

        <p className="coming-soon-note">Coming soon!</p>
      </main>
    </div>
  )
}

// buttons are held in a 2d array
// [["text", "link"], ..]
export function ProgramCard({ title, desc, buttons }) {
  return (
    <section className="program-card">
      <header className="program-header">
        <h2 id="musicopia-title">{title}</h2>
        <p className="program-subtitle">{desc}</p>
      </header>

      <div className="action-grid">
        {buttons.map(([text, link]) => {
          if (!link) {
            return (
              <button key={text} className="action-btn" type="button" disabled>
                {text}
              </button>
            )
          }

          return (
            <a key={text} href={link} target="_blank" rel="noreferrer">
              <button className="action-btn" type="button">
                {text}
              </button>
            </a>
          )
        })}
      </div>
    </section>
  )
}
