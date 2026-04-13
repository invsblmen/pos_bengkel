import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@components/ProtectedRoute'
import DashboardLayout from '@components/Layout/DashboardLayout'
import Dashboard from '@pages/Dashboard'
import Login from '@pages/Login'
import Unauthorized from '@pages/Unauthorized'
import AdminPanel from '@pages/AdminPanel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />

              <Route element={<ProtectedRoute requiredPermissions={['users-access', 'roles-access', 'permissions-access']} />}>
                <Route path="admin" element={<AdminPanel />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
