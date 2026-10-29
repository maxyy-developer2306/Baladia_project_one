import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';

export default function Verify() {
  const { uniqueKey } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/certificates/verify/${uniqueKey}`)
      .then((res) => {
        setCert(res.data.certificate);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Certificate not found.');
        setLoading(false);
      });
  }, [uniqueKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="text-blue-600 hover:underline text-sm">Back to home</a>
        </div>
      </div>
    );
  }

  const isActive = cert.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-lg font-bold text-blue-700 flex items-center gap-2">
          <CheckCircle2 size={20} /> Health Certificate Portal
        </a>
        <a href="/verify" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
          Verify Another
        </a>
      </nav>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
              <p className="text-gray-600">Unique Key: <span className="font-mono text-sm">{cert.uniqueKey}</span></p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isActive
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {isActive ? 'Active' : 'Deactive'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
              <p className="text-gray-900">{cert.name || '—'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Certificate Number</label>
              <p className="text-gray-900">{cert.certificateNumber || '—'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Identity Number</label>
              <p className="text-gray-900">{cert.identityNumber || '—'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Nationality</label>
              <p className="text-gray-900">{cert.nationality || '—'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Profession</label>
              <p className="text-gray-900">{cert.profession || '—'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Facility</label>
              <p className="text-gray-900">{cert.facilityName || '—'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Issue Date</label>
              <p className="text-gray-900">{cert.issueDateGregorian || cert.issueDateHijri || '—'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Expiry Date</label>
              <p className="text-gray-900">{cert.expiryDateGregorian || cert.expiryDateHijri || '—'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
              <p className={`text-gray-900 ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                {cert.status}
              </p>
            </div>
          </div>
          {cert.userPhoto && (
            <div className="mt-6">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Person Photo</label>
              <img
                src={cert.userPhoto}
                alt="Person photo"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <QrCode size={40} className="text-blue-600" />
              <span className="text-sm text-gray-600">Scan to verify</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm flex items-center gap-2 cursor-pointer"
            >
              <span className="text-[10px]">link</span> Copy URL
            </button>
            <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
              Open Verification Link
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}