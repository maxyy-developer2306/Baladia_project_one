import { useState } from 'react';
import { FileImage, Plus } from 'lucide-react';

const FIELDS = [
  { key: 'name', label: 'الإسم (Name)', type: 'text', required: true },
  { key: 'certificateNumber', label: 'رقم الشهادة الصحية', type: 'text', required: true },
  { key: 'identityNumber', label: 'رقم الهوية', type: 'text', required: true },
  { key: 'gender', label: 'الجنس', type: 'text', required: true },
  { key: 'nationality', label: 'الجنسية', type: 'text', required: true },
  { key: 'profession', label: 'المهنة', type: 'text', required: true },
  { key: 'amanah', label: 'الأمانة', type: 'text', required: true },
  { key: 'municipality', label: 'البلدية', type: 'text', required: true },
  { key: 'issueDateHijri', label: 'تاريخ إصدار الشهادة هجري', type: 'text', placeholder: '1447/10/12', required: true },
  { key: 'issueDateGregorian', label: 'تاريخ إصدار الشهادة ميلادي', type: 'text', required: true },
  { key: 'expiryDateHijri', label: 'تاريخ نهاية الشهادة هجري', type: 'text', placeholder: '1448/10/12', required: true },
  { key: 'expiryDateGregorian', label: 'تاريخ نهاية الشهادة ميلادي', type: 'text', required: true },
  { key: 'programEndDate', label: 'تاريخ إنهاء البرنامج التثقيفي', type: 'text', placeholder: '1450/10/12', required: true },
  { key: 'programType', label: 'نوع البرنامج التثقيفي', type: 'text', required: true },
  { key: 'licenseNumber', label: 'رقم الرخصة', type: 'text', required: false },
  { key: 'facilityName', label: 'إسم المنشأة', type: 'text', required: false },
  { key: 'facilityNumber', label: 'رقم المنشأة', type: 'text', required: false },
];

export default function CertificateForm({ initialData, onSubmit, submitting }) {
  const [form, setForm] = useState({
    ...Object.fromEntries(FIELDS.map((f) => [f.key, initialData?.[f.key] || ''])),
    status: initialData?.status || 'active',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(initialData?.userPhoto || '');

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, photo: file }));
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    FIELDS.forEach((f) => {
      if (form[f.key]) fd.append(f.key, form[f.key]);
    });
    fd.append('status', form.status);
    if (form.photo) fd.append('photo', form.photo);
    onSubmit(fd);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {initialData ? 'Edit Certificate' : 'Add New Certificate'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="active">Active</option>
              <option value="deactive">Deactive</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-medium text-gray-700">Person Photo (optional)</label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="photo-input"
                className="px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition text-sm flex items-center gap-2 cursor-pointer"
              >
                <FileImage size={18} />
                {form.photo ? 'Change photo' : 'Choose photo'}
              </label>
              <input
                id="photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhoto}
                className="hidden"
              />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              )}
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className={`px-6 py-3 rounded-lg transition text-sm font-medium flex items-center gap-2 ${submitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <Plus size={18} />
          {submitting ? 'Saving...' : initialData ? 'Update Certificate' : 'Create Certificate'}
        </button>
      </form>
    </div>
  );
}