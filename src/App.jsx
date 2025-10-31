import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";
import SideNav from "./components/SideNav.jsx";
import AuthGuard from "./components/AuthGuard.jsx";

export default function App() {
  const isAuthed =
    localStorage.getItem("csrfToken") && sessionStorage.getItem("jwtToken");

  return (
    <div className={isAuthed ? "app-shell" : undefined}>
      {isAuthed && <SideNav />}

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/register"
            element={
              <LoginGuard>
                <Register />
              </LoginGuard>
            }
          />

          <Route
            path="/login"
            element={
              <LoginGuard>
                <Login />
              </LoginGuard>
            }
          />
          <Route element={<AuthGuard />}>
            <Route path="/chat" element={<Chat />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function LoginGuard({ children }) {
  const token = sessionStorage.getItem("token");

  if (token) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}
