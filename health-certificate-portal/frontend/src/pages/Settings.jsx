import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api';

export default function Settings() {
  const [active, setActive] = useState('main');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/settings/redirect-destination')
      .then((res) => {
        setActive(res.data.activeRedirectDeployment || 'main');
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.put('/settings/redirect-destination', {
        activeRedirectDeployment: active,
      });
      setMessage(`Redirect destination set to ${active}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update redirect destination.');
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <nav className="mb-6">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
          <Shield size={16} /> Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Redirect Destination</h1>
          </div>

          <p className="text-gray-600 mb-6">
            Choose which deployment handles QR code redirects. Both deployments
            remain live, so existing QR codes continue working regardless of
            this selection. New QR codes will use the selected deployment's URL.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 size={18} /> {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl border-2 ${
                active === 'main'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } cursor-pointer transition group`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="activeRedirectDeployment"
                    value="main"
                    checked={active === 'main'}
                    onChange={(e) => setActive(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Main</div>
                    <div className="text-xs text-gray-500">app-balady-gov-sa</div>
                  </div>
                </label>
              </div>
              <div className={`p-4 rounded-xl border-2 ${
                active === 'backup'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } cursor-pointer transition group`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="activeRedirectDeployment"
                    value="backup"
                    checked={active === 'backup'}
                    onChange={(e) => setActive(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Backup</div>
                    <div className="text-xs text-gray-500">app-balady-gov-com</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-200 disabled:cursor-not-allowed transition text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : null}
                Save Destination
              </button>
            </div>
          </form>
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
            <p className="font-semibold mb-2">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>QR codes use <code className="bg-blue-200 px-1 py-0.5 rounded">/r/:uniqueKey</code> on the active deployment.</li>
              <li>Scanning a QR code redirects to the verification page on that same deployment.</li>
              <li>Both deployments run identical code, so switching destination does not break existing QR codes.</li>
              <li>If the deployment containing the redirect endpoint is deleted, QR codes pointing to it will no longer work.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}