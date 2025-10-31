import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser, getUserById } from "../services/api";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [f, setF] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();

    try {
      // Clean up any old localStorage data (migration from localStorage to sessionStorage)
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("avatar");
      localStorage.removeItem("csrfToken");

      const token = await loginUser(f.username, f.password);
      if (!token) throw new Error("No token returned");

      sessionStorage.setItem("jwtToken", token);

      const payload = jwtDecode(token);
      const userId = payload?.userId || payload?.sub || payload?.id || "";
      const username = payload?.username || f.username;

      if (userId) {
        sessionStorage.setItem("userId", String(userId));
      }
      if (username) {
        sessionStorage.setItem("username", username);
      }

      try {
        if (userId) {
          const userData = await getUserById(userId);
          const avatar =
            userData?.avatar ||
            userData?.user?.avatar ||
            payload?.avatar ||
            null;
          
          if (avatar) {
            sessionStorage.setItem("avatar", avatar);
          } else {
            let hash = 0;
            for (let i = 0; i < username.length; i++) {
              hash = username.charCodeAt(i) + ((hash << 5) - hash);
            }
            const avatarId = Math.abs(hash % 70) + 1;
            const generatedAvatar = `https://i.pravatar.cc/200?img=${avatarId}`;
            sessionStorage.setItem("avatar", generatedAvatar);
          }
        } else {
          let hash = 0;
          for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
          }
          const avatarId = Math.abs(hash % 70) + 1;
          const generatedAvatar = `https://i.pravatar.cc/200?img=${avatarId}`;
          sessionStorage.setItem("avatar", generatedAvatar);
        }
      } catch {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
          hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const avatarId = Math.abs(hash % 70) + 1;
        const generatedAvatar = `https://i.pravatar.cc/200?img=${avatarId}`;
        sessionStorage.setItem("avatar", generatedAvatar);
      }

      location.assign("/chat");
    } catch (err) {
      const m = err?.message || "Invalid credentials";
      setMsg(m);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="chatify-header">Chatify</div>
      <div className="form-icon">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <h2>Logga in</h2>
      <input
        placeholder="Username"
        required
        value={f.username}
        onChange={(e) => setF({ ...f, username: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        required
        value={f.password}
        onChange={(e) => setF({ ...f, password: e.target.value })}
      />
      <button type="submit">Logga in</button>
      {msg && <p className="error">{msg}</p>}
      <Link to="/register">Har du inget konto? Registrera dig</Link>
    </form>
  );
}
