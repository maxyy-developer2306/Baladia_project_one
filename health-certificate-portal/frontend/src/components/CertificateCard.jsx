import { Copy, CheckCircle2, Ban, Image, ImageOff } from 'lucide-react';

export default function CertificateCard({ certificate, onStatusChange }) {
  const isActive = certificate.status === 'active';
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{certificate.name || 'Unnamed'}</h2>
          <p className="text-sm text-gray-500 mt-1">{certificate.uniqueKey}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">Certificate No.</div>
              <div className="text-gray-900">{certificate.certificateNumber || '—'}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">ID Number</div>
              <div className="text-gray-900">{certificate.identityNumber || '—'}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">Profession</div>
              <div className="text-gray-900">{certificate.profession || '—'}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">Facility</div>
              <div className="text-gray-900">{certificate.facilityName || '—'}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">Issue Date</div>
              <div className="text-gray-900">{certificate.issueDateGregorian || certificate.issueDateHijri || '—'}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500 uppercase font-semibold">Expiry Date</div>
              <div className="text-gray-900">{certificate.expiryDateGregorian || certificate.expiryDateHijri || '—'}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isActive
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {isActive ? 'Active' : 'Deactive'}
          </span>
          {onStatusChange && (
            <button
              onClick={() => onStatusChange(certificate._id, isActive ? 'deactive' : 'active')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              {isActive ? <Ban size={16} /> : <CheckCircle2 size={16} />}
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      </div>
      {certificate.userPhoto && (
        <div className="mt-4">
          <img
            src={certificate.userPhoto.startsWith('/uploads/') ? 'http://localhost:4000' + certificate.userPhoto : certificate.userPhoto}
            alt="Certificate photo"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.target.src = '';
            }}
          />
        </div>
      )}
    </div>
  );
}