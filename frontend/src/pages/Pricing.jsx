import { Route, Link } from 'react-router-dom'
import styles from './Pricing.module.css'
import Pickbot, { Dialogue } from '../components/Pickbot'

export default function Pricing() {
  return (
    <div className={styles['pricing-root']}>
      <main className={styles['main-container']}>
        <div className={styles['pricing-card']}>
          <div className={styles['header-section']}>
            <Pickbot />
            <Dialogue
              text={
                'Free gets you started.\nPremium gives you everything - lessons, songs, and impact! '
              }
            />
          </div>

          <div className={styles['plans-container']}>
            <PlanCard
              title={'Freemium'}
              desc={'Perfect to get started on your musical journey'}
              startText={'Start Free'}
              features={[
                'First five lessons for free',
                'Limited song library',
                'Progress tracking',
                'Free with ads'
              ]}
            />

            <PlanCard
              title={'Premium'}
              desc={'Everything you need plus exclusive features and content'}
              startText={'Go Premium'}
              features={[
                'All premium lessons',
                'Complete song library',
                'Personal chatbot',
                'Select your school; See your real time impact!',
                'Add & Battle your friends!'
              ]}
              isPremium={true}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export function PlanCard({ title, desc, features, startText, isPremium }) {
  
  const list = features.map((feature, idx) => <li key={idx}>{feature}</li>)
  
  return (
    <>
      
      <div className={styles['pricing-options']}>
        <div className={[styles['plan-card'], isPremium ? styles['premium-card'] : ''].filter(Boolean).join(' ')}>
          <div className={styles['plan-title']}>{title}</div>
          <div className={styles['plan-description']}>{desc}</div>
          <ul className={styles['plan-features']}>
            {list}
          </ul>
          <Link to="/username">
            <button className={styles['plan-button']}>
              {startText}
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}

// export function MainContainer
