import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Logo from './components/Logo'
import './App.css'
import Signup from './pages/Signup'
import Start from './pages/Start'
import Onboard from './pages/Onboard/Onboard'
import Pricing from './pages/Pricing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogoLink />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/start" element={<Start />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

function LogoLink() {
  return (
    <Link to="/signup">
      <Logo />
    </Link>
  )
}
