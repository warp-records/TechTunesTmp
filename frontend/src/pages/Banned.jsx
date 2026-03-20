import { useContext } from 'react'
import { AuthContext } from '../App'
import banhammer from '../assets/Badpage/banhammer.png'

export default function Banned() {
  const { user } = useContext(AuthContext);
  const permanent = user?.banned && new Date(user.banned).getFullYear() === 9999;
  const until = user?.banned ? new Date(user.banned).toLocaleDateString() : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0a0a", color: "white", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "6rem" }} />
        <h1 style={{ fontSize: "3rem", color: "#ff6666", margin: 0 }}>You're banned</h1>
        <img src={banhammer} alt="banhammer" style={{ height: "6rem" }} />
      </div>
      <p style={{ color: "#aaa" }}>{permanent ? "This ban is permanent." : `Your ban expires on ${until}.`}</p>
      {user?.ban_message && <p style={{ color: "#aaa", fontStyle: "italic" }}>Reason: "{user.ban_message}"</p>}
    </div>
  )
}
