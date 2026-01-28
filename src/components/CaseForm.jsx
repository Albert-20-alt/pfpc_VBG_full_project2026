import React, { useState } from 'react';
import { createCase, updateCase } from '../api';

function CaseForm({ initialData, onSuccess }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState(initialData?.status || 'open');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (initialData?.id) {
        await updateCase(initialData.id, { title, description, status });
      } else {
        await createCase({ title, description, status });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">{initialData ? 'Modifier le cas' : 'Créer un cas'}</h2>
      <div className="mb-3">
        <label className="block mb-1">Titre</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border p-2 rounded" />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded" />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Statut</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border p-2 rounded">
          <option value="open">Ouvert</option>
          <option value="pending">En attente</option>
          <option value="closed">Fermé</option>
        </select>
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Envoi…' : (initialData ? 'Modifier' : 'Créer')}
      </button>
    </form>
  );
}

export default CaseForm;
