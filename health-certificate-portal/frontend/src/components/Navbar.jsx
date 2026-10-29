import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Shield, User, CheckCircle2 } from 'lucide-react';
import { authStore } from '../store/auth';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(authStore.getUser());

  // Agar URL mein '/view' aata hai (jaise certificate view page), toh navbar show nahi hoga
  if (location.pathname.includes('/view')) {
    return null;
  }

  useEffect(() => {
    const unsub = authStore.subscribe(setUser);
    return unsub;
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore
    }
    authStore.clearUser();
    navigate('/login');
  };

  if (!user) {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-blue-700 flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span>Health Certificate Portal</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/verify" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            Verify Certificate
          </Link>
          <Link to="/login" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
            Admin Login
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="text-lg font-bold text-blue-700 flex items-center gap-2">
        <Shield size={20} />
        <span>Admin Dashboard</span>
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
          <User size={16} />
          <span>{user.username}</span>
        </div>
        <Link to="/settings" className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
          Settings
        </Link>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium cursor-pointer flex items-center gap-1.5">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}