import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Logo from './components/Logo'
import './App.css'
import Signup from './pages/Signup'
import Start from './pages/Start'
import Onboard from './pages/Onboard/Onboard'
import Pricing from './pages/Pricing'
import Create from './pages/Create/Create'
import Username from './pages/Username'
import Userpage from './pages/Userpage'
import Homepage from './pages/Homepage'
import GuitarTuner from './pages/GuitarTuner'
import Impact from './pages/Impact'
import Login from './pages/Login'
import IslandSelect from './pages/IslandSelect'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogoLink />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/start" element={<Start />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/username" element={<Username />} />
        <Route path="/create" element={<Create />} />
        <Route path="/userpage" element={<Userpage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/guitar_tuner" element={<GuitarTuner />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/island_select" element={<IslandSelect />} />
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
