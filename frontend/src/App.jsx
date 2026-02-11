import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import logo from './assets/logo.png'
import './App.css'
import Signup from './Signup'
import Start from './Start'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogoLink />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/start" element={<Start />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

function Logo() {
  return (
    <>
      <img src={logo} className="logo-container" alt="Tech Tunes Logo" />
    </>
  )
}

function LogoLink() {
  return (
    <>
      <Link to="/signup">
        <Logo />
      </Link>
    </>
  )
}