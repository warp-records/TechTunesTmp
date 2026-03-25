import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import npStyles from './NonProfit.module.css'

export default function NonProfit() {
  const [tab, setTab] = useState('login') // 'login' | 'request'
  return (
    <div className={styles['login-container']}>
      <div className={[styles['login-card'], npStyles['np-card']].join(' ')}>
        <div className={npStyles['np-header']}>
          <span className={npStyles['np-icon']}>🏛️</span>
          <h3 className={npStyles['np-title']}>Non Profit Portal</h3>
        </div>
        <div className={npStyles['np-tabs']}>
          <button
            className={[npStyles['np-tab'], tab === 'login' ? npStyles['np-tab-active'] : ''].join(' ')}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            className={[npStyles['np-tab'], tab === 'request' ? npStyles['np-tab-active'] : ''].join(' ')}
            onClick={() => setTab('request')}
          >
            Request Access
          </button>
        </div>
        {tab === 'login' ? <NonProfitLogin /> : <NonProfitRequest />}
      </div>
    </div>
  )
}

function NonProfitLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/nonprofit/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.status === 403) {
      setError('Your account is pending approval.')
    } else if (!res.ok) {
      setError('Invalid email or password.')
    } else {
      const data = await res.json()
      localStorage.setItem('np_token', data.token)
      localStorage.setItem('np_name', data.name)
      navigate('/nonprofit/dashboard')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <div className={styles['form-group']}>
        <label>Organization Email</label>
        <input type="email" placeholder="Enter your organization email" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className={styles['form-group']}>
        <label>Password</label>
        <input type="password" placeholder="Enter your password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <p className={npStyles['np-error']}>{error}</p>}
      <button className={[styles['btn'], npStyles['btn-np']].join(' ')}>Sign In</button>
    </form>
  )
}

function NonProfitRequest() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState(null) // null | 'success' | 'error'
  const [error, setError] = useState(null)

  async function handleRequest(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    const res = await fetch('/api/nonprofit/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (res.status === 409) {
      const data = await res.json()
      setError(data.detail === 'EmailTaken' ? 'That email is already registered.' : 'That organization name is already taken.')
    } else if (!res.ok) {
      setError('Something went wrong. Please try again.')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className={npStyles['np-success']}>
        <div className={npStyles['np-success-icon']}>✓</div>
        <h4>Request Submitted</h4>
        <p>Your request is pending review. You'll be able to log in once an admin approves your account.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleRequest}>
      <div className={styles['form-group']}>
        <label>Organization Name</label>
        <input placeholder="Enter your organization name" required value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className={styles['form-group']}>
        <label>Email</label>
        <input type="email" placeholder="Enter your organization email" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className={styles['form-group']}>
        <label>Password</label>
        <input type="password" placeholder="Create a password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div className={styles['form-group']}>
        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm your password" required value={confirm} onChange={e => setConfirm(e.target.value)} />
      </div>
      {error && <p className={npStyles['np-error']}>{error}</p>}
      <button className={[styles['btn'], npStyles['btn-np']].join(' ')}>Request Access</button>
    </form>
  )
}
