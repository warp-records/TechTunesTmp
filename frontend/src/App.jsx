import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Logo from './components/Logo'
import './App.css'
import Signup from './pages/Signup'
import Start from './pages/Start'

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

function LogoLink() {
  return (
    <Link to="/signup">
      <Logo />
    </Link>
  )
}
