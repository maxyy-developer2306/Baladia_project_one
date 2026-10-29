import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  RefreshCw,
  Eye,
  Pencil,
  X,
  Power
} from 'lucide-react';
import api from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import CertificateForm from '../components/CertificateForm';

export default function Dashboard() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    loadCerts();
  }, [search, statusFilter]);

  const loadCerts = async () => {
    setLoading(true);

    try {
      const params = {};

      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/certificates', { params });
      setCerts(res.data.certificates || []);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load certificates.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (fd) => {
    setSaving(true);

    try {
      await api.post('/certificates', fd);
      setShowForm(false);
      setEditing(null);
      await loadCerts();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create certificate.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (fd) => {
    if (!editing?._id) return;

    setSaving(true);

    try {
      await api.put(`/certificates/${editing._id}`, fd);
      setShowForm(false);
      setEditing(null);
      await loadCerts();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update certificate.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    setDeleting(true);

    try {
      await api.delete(`/certificates/${deletingId}`);
      setDeleteConfirm(false);
      setDeletingId(null);
      await loadCerts();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete certificate.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (cert) => {
    const newStatus =
      cert.status === 'active' ? 'deactive' : 'active';

    try {
      await api.patch(`/certificates/${cert._id}/status`, {
        status: newStatus
      });

      await loadCerts();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update status.'
      );
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (cert) => {
    setEditing(cert);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
      {/* Top Navbar Header */}
      <div className="border-b border-neutral-800 bg-[#111111]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">Dashboard</h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              Manage certificates and system records
            </p>
          </div>

          <button
            onClick={openCreate}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-white px-3.5 py-2 text-sm font-medium text-black hover:bg-neutral-200 transition-colors"
          >
            <Plus size={16} />
            Add Certificate
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="cursor-pointer hover:text-white transition-colors"
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-neutral-800 bg-[#111111] p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-3 text-neutral-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certificates..."
              className="w-full rounded-md border border-neutral-800 bg-[#1a1a1a] py-2 pl-10 pr-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cursor-pointer rounded-md border border-neutral-800 bg-[#1a1a1a] px-3.5 py-2 text-sm text-white outline-none focus:border-neutral-600 transition-colors"
          >
            <option value="" className="bg-[#1a1a1a]">All Status</option>
            <option value="active" className="bg-[#1a1a1a]">Active</option>
            <option value="deactive" className="bg-[#1a1a1a]">Deactive</option>
          </select>

          <button
            onClick={loadCerts}
            disabled={loading}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-neutral-800 bg-[#1a1a1a] px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Main Data Table Card */}
        <div className="overflow-hidden rounded-lg border border-neutral-800 bg-[#111111]">
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3.5">
            <h2 className="text-sm font-semibold text-white">Certificates List</h2>
            <span className="text-xs text-neutral-400 font-mono">
              {certs.length} records
            </span>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-neutral-500">
              Loading certificates...
            </p>
          ) : certs.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">
              No certificates found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#161616] text-xs font-medium text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">Certificate</th>
                    <th className="whitespace-nowrap px-4 py-3">Name</th>
                    <th className="whitespace-nowrap px-4 py-3">ID Number</th>
                    <th className="whitespace-nowrap px-4 py-3">Profession</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800/60">
                  {certs.map((cert) => (
                    <tr key={cert._id} className="hover:bg-[#161616]/50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-white font-mono text-xs">
                        {cert.certificateNumber || cert.uniqueKey || cert._id}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-neutral-300">
                        {cert.name || '-'}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-neutral-400 font-mono text-xs">
                        {cert.identityNumber || '-'}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-neutral-400">
                        {cert.profession || '-'}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            cert.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cert.status === 'active' ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                          {cert.status || 'unknown'}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Status Toggle Button */}
                          <button
                            onClick={() => handleStatusChange(cert)}
                            title={cert.status === 'active' ? 'Click to Deactive' : 'Click to Active'}
                            aria-label="Toggle status"
                            className={`cursor-pointer rounded p-2 transition-colors ${
                              cert.status === 'active'
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                            }`}
                          >
                            <Power size={16} />
                          </button>

                          <button
                            onClick={() =>
                              window.open(`/certificates/${cert._id}/view`, '_blank')
                            }
                            title="View"
                            aria-label="View certificate"
                            className="cursor-pointer rounded p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => openEdit(cert)}
                            title="Edit"
                            aria-label="Edit certificate"
                            className="cursor-pointer rounded p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(cert._id)}
                            title="Delete"
                            aria-label="Delete certificate"
                            className="cursor-pointer rounded p-2 text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form (used for both Add and Edit) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          {/* Bigger modal: wider (max-w-5xl) and taller (min-h-[80vh], max-h-[95vh]) */}
          <div className="relative flex max-h-[95vh] min-h-[80vh] w-full max-w-5xl flex-col overflow-y-auto rounded-xl border border-neutral-800 bg-[#121212] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-[#121212] px-6 py-4">
              <h2 className="text-base font-semibold text-white">
                {editing ? 'Edit Certificate' : 'Add Certificate'}
              </h2>

              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="cursor-pointer rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            {/*
              The [&_input] / [&_select] / [&_textarea] classes style every field
              inside CertificateForm: white background, black text, taller fields.
              The "!" makes them override any classes set inside CertificateForm.
            */}
            <div
              className="flex-1 p-6 text-gray-200
                [&_input]:!h-11 [&_input]:!rounded-md [&_input]:!border [&_input]:!border-neutral-300 [&_input]:!bg-white [&_input]:!px-3 [&_input]:!text-black [&_input]:placeholder:!text-neutral-500
                [&_select]:!h-11 [&_select]:!rounded-md [&_select]:!border [&_select]:!border-neutral-300 [&_select]:!bg-white [&_select]:!px-3 [&_select]:!text-black
                [&_option]:!bg-white [&_option]:!text-black
                [&_textarea]:!min-h-[110px] [&_textarea]:!rounded-md [&_textarea]:!border [&_textarea]:!border-neutral-300 [&_textarea]:!bg-white [&_textarea]:!px-3 [&_textarea]:!py-2 [&_textarea]:!text-black [&_textarea]:placeholder:!text-neutral-500"
            >
              <CertificateForm
                initialData={editing}
                onSubmit={editing ? handleUpdate : handleCreate}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (deleting) return;
          setDeleteConfirm(false);
          setDeletingId(null);
        }}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
      />
    </div>
  );
}