
import "./Userpage.css"

export default function Userpage() {
  return (
  <>
    
    
  <main class="container">
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