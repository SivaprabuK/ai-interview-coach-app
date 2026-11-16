import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')

  if (!accessToken || !refreshToken) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
