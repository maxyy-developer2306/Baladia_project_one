import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Verify from './pages/Verify';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CertificateDetails from './pages/CertificateDetails';
import { authStore } from './store/auth';
import api from './api';

function App() {
  // Check for an existing session only once, when the app first loads.
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => authStore.setUser(res.data.user))
      .catch(() => authStore.clearUser());
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/verify" element={
          <ProtectedRoute>
            <Verify />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/certificates/:id/view" element={<CertificateDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;