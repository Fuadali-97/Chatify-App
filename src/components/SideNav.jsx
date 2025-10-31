import { logoutUser } from "../services/api"

export default function SideNav() {

  function handleLogout() {
    logoutUser()
    window.location.href = "/login"
  }

  return (
    <aside className="sidenav">
      <button className="logout-btn" onClick={handleLogout}>
        Logga ut
      </button>
    </aside>
  )
}