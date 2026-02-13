import { Route } from 'react-router-dom'
import './Pricing.css'

export default function Pricing() {
  return (<>
  <main class="main-container">
      <div class="pricing-card">
        <PlanCard
          title={"Freemium"}
          desc={"Perfect if you're poor or broke"}
          startText={"Start Free"}
          features={["Will be hounded with pop ups insisting you pay up", "Intrusive ads"]}
        />
        
        <PlanCard
          title={"Premium"}
          desc={"Great if you love forking over your hard earned money to us"}
          startText={"Go Premium"}
          features={["Can flex to your friends that you're rich"]}
        />
      </div>
  </main>
  </>
  )
  
}

export function PlanCard({ title, desc, features, startText }) {
  
  const list = features.map((feature, idx) => <li key={idx}>{feature}</li>)
  
  return (
    <>
    <div className="pricing-options">
      <div className="plan-card">
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