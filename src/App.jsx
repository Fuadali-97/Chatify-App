import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";
import SideNav from "./components/SideNav.jsx";
import AuthGuard from "./components/AuthGuard.jsx";

export default function App() {
  // Clean up old localStorage data on app start (keep only botAvatar)
  useEffect(() => {
    // Only remove if we're using sessionStorage now (migration cleanup)
    if (sessionStorage.getItem("csrfToken") || sessionStorage.getItem("jwtToken")) {
      localStorage.removeItem("csrfToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("avatar");
      // Keep botAvatar in localStorage - that's correct
    }
  }, []);

  const isAuthed =
    sessionStorage.getItem("csrfToken") && sessionStorage.getItem("jwtToken");

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
  const token = sessionStorage.getItem("jwtToken");

  if (token) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}
