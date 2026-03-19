import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom'
import Logo from './components/Logo'
import serverRackFall from './assets/Badpage/server_rack_fall.jpg'
import thisIsFine from './assets/Badpage/thisisfine.jpg'
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
import ParentPermission from './pages/ParentPermission/ParentPermission'
import Admin from './pages/Admin'
import LessonIslandPage from './features/lesson-islands/pages/LessonIslandPage'
import { LESSON_ISLAND_ROUTE_PATTERN } from './features/lesson-islands/constants/lessonIslandRoutes'

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogoLink />} />
        {/* only accessible if not logged in */}
        <Route element={<ProtectedRoute isAllowed={user => !user} redirectPath="/userpage" />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/start" element={<Start />} />
          <Route path="/onboard" element={<Onboard />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>
        <Route path="/account_create" element={<AccountCreate />} />
        
        {/* require account to be registered and have parents permission if necessary*/}
        <Route element={<ProtectedRoute isAllowed={user => !!user} />}>
          <Route element={<ProtectedRoute isAllowed={user => !user.needs_verification} redirectPath="/parent_permission" />}>
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
          </Route>
        </Route>
        
        <Route path="/login" element={<Login />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/parent_permission" element={<ParentPermission />} />
        <Route path="/*" element={<BadPage />}></Route>
        
          <Route element={<ProtectedRoute isAllowed={user => user?.admin} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
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

function BadPage() {
  const { user } = useAuth();
  const loggedOut = !user;
  return (
    <div style={{ "color": "white", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "20px", "paddingTop": "60px" }}>
      <p style={{ "font-size": "50px" }}>Page not found rip</p>
      <p style={{ "font-size": "20px" }}>Either you're not authorized to see this page,
        or our servers like exploded or something</p>
      <br></br>
      {loggedOut
        ? <p>Maybe try <Link to="/login" style={{ textDecoration: "none", borderBottom: "1px solid white", color: "white" }}>logging in</Link>?</p>
        : <p>Maybe try rice?</p>
      }
      <img src={serverRackFall} alt="its fine" />
    </div>
  )
}


export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  function fetchUser() {
    const token = localStorage.getItem("token");
    if (!token) { setUser(null); return Promise.resolve(); }

    return fetch("/api/me", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }

  useEffect(() => { fetchUser(); }, []);

  return <AuthContext.Provider value={{ user, fetchUser }}>{children}</AuthContext.Provider>
}
const useAuth = () => useContext(AuthContext)

function ProtectedRoute({ isAllowed, redirectPath="/bad_page", children }) {
  const { user } = useAuth();

  // when fetching page
  if (user === undefined) return null;
  if (!isAllowed(user)) return <Navigate to={redirectPath} replace />;
  return children ? children : <Outlet />;
}