import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './NonProfitDashboard.module.css'
import moneyRain from '../assets/money_rain.webm'
import chaching from '../assets/chaching.mp3'

export default function NonProfitDashboard() {
  const [org, setOrg] = useState(null)
  const [withdrawn, setWithdrawn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('np_token')
    if (!token) { navigate('/nonprofit'); return }
    fetch('/api/nonprofit/me', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => { if (!r.ok) { navigate('/nonprofit'); return null } return r.json() })
      .then(data => { if (data) setOrg(data) })
  }, [])

  function logout() {
    localStorage.removeItem('np_token')
    localStorage.removeItem('np_name')
    navigate('/nonprofit')
  }

  if (!org) return null

  return (
    <div className={styles['root']}>
      <video className={styles['bg-video']} src={moneyRain} autoPlay loop muted playsInline />
      <div className={styles['header']}>
        <div className={styles['header-left']}>
          <span className={styles['header-icon']}>🏛️</span>
          <div>
            <div className={styles['header-name']}>{org.name}</div>
            <div className={styles['header-email']}>{org.email}</div>
          </div>
        </div>
        <button className={styles['logout-btn']} onClick={logout}>Log out</button>
      </div>

      <div className={styles['content']}>
        <div className={styles['balance-card']}>
          <div className={styles['balance-label']}>Available Balance</div>
          <div className={styles['balance-amount']}>${org.balance.toLocaleString()}</div>
          {withdrawn
            ? <div className={styles['withdraw-confirm']}>
                <span className={styles['withdraw-check']}>✓</span>
                <span>An email will be sent to your account</span>
              </div>
            : <button
                className={styles['withdraw-btn']}
                onClick={() => { new Audio(chaching).play(); setWithdrawn(true) }}
                disabled={org.balance === 0}
              >
                Withdraw Funds
              </button>
          }
        </div>
      </div>

    </div>
  )
}

