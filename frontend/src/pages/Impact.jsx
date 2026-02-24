
import './Impact.css'

export default function Impact() {
  return (<>
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
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <ProgramCard
        title="Musicopia"
        desc="Cliche description"
        buttons={[["Donate Money", "https://www.musicopia.net/instrument-donation-form"]]}
      />
    </main>
  </>
  )
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
        {
          buttons.map((data) => {
            const text = data[0];
            const link = data[1];
            
            return (
              <button class="action-btn">
                <a href={link} target="_blank">{text}</a>
              </button>
            )
          })
        }
        
      </div>
    </section>
    
  )
  
  
}