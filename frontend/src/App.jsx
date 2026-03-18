import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Logo from './components/Logo'
import './App.css'
import Signup from './pages/Signup'
import Start from './pages/Start'
import Onboard from './pages/Onboard/Onboard'
import Pricing from './pages/Pricing/Pricing'
import PickbotEdit from './pages/PickbotEdit/Create'
import AccountCreate from './pages/AccountCreate'
import Userpage from './pages/Userpage'
import Homepage from './pages/Homepage'
import GuitarTuner from './pages/GuitarTuner'
import Impact from './pages/Impact'
import Login from './pages/Login'
import IslandSelect from './pages/IslandSelect'
import GuitarIsland from './pages/Islands/GuitarIsland'
import SongSearch from './pages/SongSearch'
import Lesson from './pages/Lesson/Lesson'
import Payment from './pages/Payment/Payment'
import LessonIslandPage from './features/lesson-islands/pages/LessonIslandPage'
import { LESSON_ISLAND_ROUTE_PATTERN } from './features/lesson-islands/constants/lessonIslandRoutes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogoLink />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/start" element={<Start />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/account_create" element={<AccountCreate />} />
        <Route path="/pickbot_edit" element={<PickbotEdit />} />
        <Route path="/userpage" element={<Userpage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/guitar_tuner" element={<GuitarTuner />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/island_select" element={<IslandSelect />} />
        <Route path="/guitar_island" element={<GuitarIsland />} />
        <Route path={LESSON_ISLAND_ROUTE_PATTERN} element={<LessonIslandPage />} />
        <Route path="/song_search" element={<SongSearch />} />
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/payment" element={<Payment />} />
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
