import "./Impact.css";

export default function Impact() {
  return (
    <>
      <header class="impact-header">
        <h1 class="impact-title">IMPACT PAGE</h1>
      </header>

      <main class="impact-page" aria-labelledby="page-title">
        <div class="region-select">
          <button
            id="philly-btn"
            class="region-btn"
            type="button"
            aria-haspopup="listbox"
            aria-expanded="false"
            aria-controls="philly-menu"
          >
            <span>Philadelphia</span>
            <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
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

        <div class="region-select">
          <button
            class="region-btn disabled"
            type="button"
            aria-disabled="true"
            title="Coming soon"
          >
            <span>New Jersey</span>
            <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              ></path>
            </svg>
          </button>
        </div>
        
       <p class="coming-soon-note">Coming soon!</p> 
      </main>
    </>
  );
}

// buttons are held in a 2d array
// [["text", "link"], ..]
export function ProgramCard({ title, desc, buttons }) {
  return (
    <section class="program-card">
      <header class="program-header">
        <h2 id="musicopia-title">{title}</h2>
        <p class="program-subtitle">{desc}</p>
      </header>

      <div class="action-grid">
        {buttons.map((data) => {
          const text = data[0];
          const link = data[1];

          return (
            <a href={link} target="_blank">
              <button class="action-btn">{text}</button>
            </a>
          );
        })}
      </div>
    </section>
  );
}
