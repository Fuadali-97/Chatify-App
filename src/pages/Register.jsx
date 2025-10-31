import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerUser } from '../services/api'

export default function Register() {
  const [f, setF] = useState({ username: '', email: '', password: '' })
  const [msg, setMsg] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    
    try {
      // Generera en konsekvent avatar baserat på username
      // Använd en hash av username för att få samma avatar varje gång
      let hash = 0;
      for (let i = 0; i < f.username.length; i++) {
        hash = f.username.charCodeAt(i) + ((hash << 5) - hash);
      }
      const avatarId = Math.abs(hash % 70) + 1;
      const avatar = `https://i.pravatar.cc/200?img=${avatarId}`;
      
      await registerUser(f.username, f.password, f.email, avatar)
      setMsg('Registrering lyckades! Du skickas till login...')
      setTimeout(() => location.assign('/login'), 800)
    } catch (err) {
      const m = err?.message || 'Registrering misslyckades'
      setMsg(m)
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="chatify-header">Chatify</div>
      <div className="form-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
        </svg>
      </div>
      <h2>Registrera</h2>
      <input 
        placeholder="Username" 
        required 
        value={f.username} 
        onChange={e => setF({ ...f, username: e.target.value })}
      />
      <input 
        placeholder="Email" 
        type="email" 
        required 
        value={f.email} 
        onChange={e => setF({ ...f, email: e.target.value })}
      />
      <input 
        placeholder="Password" 
        type="password" 
        required 
        value={f.password} 
        onChange={e => setF({ ...f, password: e.target.value })}
      />
      <button type="submit">Registrera</button>
      {msg && <p className={msg.includes('lyckades') ? 'notice' : 'error'}>{msg}</p>}
      <Link to="/login">Har du redan ett konto? Logga in</Link>
    </form>
  )
}