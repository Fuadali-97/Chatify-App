import { Navigate, Outlet } from 'react-router-dom'

export default function AuthGuard() {
  const token = sessionStorage.getItem('jwtToken')
  
  if (!token) return <Navigate to="/login" replace />
  
  return <Outlet />
}