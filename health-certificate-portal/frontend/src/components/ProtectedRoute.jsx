import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authStore } from '../store/auth';
import api from '../api';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(authStore.getUser());
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = authStore.subscribe(setUser);
    // Verify session with the server
    api
      .get('/auth/me')
      .then((res) => {
        authStore.setUser(res.data.user);
        setUser(res.data.user);
      })
      .catch(() => {
        authStore.clearUser();
        setUser(null);
      })
      .finally(() => setChecking(false));

    return unsub;
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}