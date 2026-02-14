import { Route } from 'react-router-dom'
import './Pricing.css'
import Pickbot, { Dialogue } from '../components/Pickbot'

export default function Pricing() {
  return (<>
    
  <main className="main-container">
      <div className="pricing-card">
        
        <div class="header-section">
          <Pickbot />
          <Dialogue text={"Free gets you started.\nPremium gives you everything - lessons, songs, and impact! "} />
        </div>
        
        <div className="plans-container">
          <PlanCard
            title={"Freemium"}
            desc={"Perfect to get started on your musical journey"}
            startText={"Start Free"}
            features={["First five lessons for free", "Limited song library", "Progress tracking", "Free with ads"]}
          />
          
          <PlanCard
            title={"Premium"}
            desc={"Everything you need plus exclusive features and content"}
            startText={"Go Premium"}
            features={
              ["All premium lessons", "Complete song library",
                "Personal chatbot", "Select your school; See your real time impact!",
              "Add & Battle your friends!"
              ]
            }
            isPremium={true}
          />
        </div>
      </div>
  </main>
  </>
  )
  
}

export function PlanCard({ title, desc, features, startText, isPremium }) {
  
  const list = features.map((feature, idx) => <li key={idx}>{feature}</li>)
  
  return (
    <>
      
      <div className={"pricing-options"}>
        <div className={`plan-card ${isPremium ? 'premium-card' : ''}`}>
          <div className="plan-title">{title}</div>
          <div className="plan-description">{desc}</div>
        <ul className="plan-features">
          {list}
        </ul>
      <button className="plan-button">
        {startText}
      </button>
      </div>
    </div>
    </>
  )
}

// export function MainContainer