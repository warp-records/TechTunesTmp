import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom'
import Logo from './components/Logo'
import BadPage from './pages/BadPage'
import './App.css'
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
import ParentPermission from './pages/ParentPermission/ParentPermission'
import Admin from './pages/Admin'
import NonProfit from './pages/NonProfit'
import NonProfitDashboard from './pages/NonProfitDashboard'
import Banned from './pages/Banned'
import LessonIslandPage from './features/lesson-islands/pages/LessonIslandPage'
import TutorialVideo from './pages/TutorialVideo'
import { LESSON_ISLAND_ROUTE_PATTERN } from './features/lesson-islands/constants/lessonIslandRoutes'

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* always accessible */}
        <Route path="/parent_permission" element={<ParentPermission />} />
        
        {/* inescapable: logged-in users who need verification always go to parent_permission */}
        <Route element={<ProtectedRoute isAllowed={user => !user || !user.needs_verification} redirectPath="/parent_permission" />}>
          <Route path="/" element={<><LogoLink /><p className="version-label">v{__APP_VERSION__}</p></>} />
          <Route path="/login" element={<Login />} />


          {/* only accessible if not logged in */}
          <Route element={<ProtectedRoute isAllowed={user => !user} redirectPath="/userpage" />}>
            <Route path="/start" element={<Start />} />
          <Route path="/nonprofit" element={<NonProfit />} />
          <Route path="/nonprofit/dashboard" element={<NonProfitDashboard />} />
            <Route path="/onboard" element={<Onboard />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
          <Route path="/account_create" element={<AccountCreate />} />

          {/* require logged in */}
          <Route element={<ProtectedRoute isAllowed={user => !!user} />}>
            <Route element={<ProtectedRoute isAllowed={user => !user.banned || new Date() >= new Date(user.banned)} redirectPath="/banned" />}>
              <Route path="/pickbot_edit" element={<PickbotEdit />} />
              <Route path="/userpage" element={<Userpage />} />
              <Route path="/homepage" element={<Homepage />} />
              <Route path="/guitar_tuner" element={<GuitarTuner />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/island_select" element={<IslandSelect />} />
              <Route path="/guitar_island" element={<GuitarIsland />} />
              <Route path={LESSON_ISLAND_ROUTE_PATTERN} element={<LessonIslandPage />} />
              <Route path="/song_search" element={<SongSearch />} />
              <Route path="/lesson" element={<Lesson />} />
                <Route path="/lesson_tutorial" element={<TutorialVideo name={"lessonTutorial"} />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute isAllowed={user => !!user?.banned && new Date() < new Date(user.banned)} redirectPath="/userpage" />}>
            <Route path="/banned" element={<Banned />} />
          </Route>

          <Route path="/payment" element={<Payment />} />
          <Route path="/*" element={<BadPage />} />

          <Route element={<ProtectedRoute isAllowed={user => user?.admin} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App

function LogoLink() {
  return (
    <Link to="/start">
      <Logo />
    </Link>
  )
}


export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  function fetchUser(_t = crypto.randomUUID()) {
    const token = localStorage.getItem("token");
    if (!token) { setUser(null); return Promise.resolve(); }

    return fetch(`/api/me?_t=${_t}`, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }

  useEffect(() => { fetchUser(); }, []);

  return <AuthContext.Provider value={{ user, fetchUser }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)

function ProtectedRoute({ isAllowed, redirectPath="/bad_page", children }) {
  const { user } = useAuth();

  // when fetching page
  if (user === undefined) return null;
  if (!isAllowed(user)) return <Navigate to={redirectPath} replace />;
  return children ? children : <Outlet />;
}