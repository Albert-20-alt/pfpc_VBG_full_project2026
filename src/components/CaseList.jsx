import React, { useEffect, useState } from 'react';
import { getCases, deleteCase } from '../api';
import CaseForm from './CaseForm';

function CaseList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchCases = () => {
    setLoading(true);
    getCases()
      .then(setCases)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce cas ?')) return;
    try {
      await deleteCase(id);
      fetchCases();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (c) => {
    setEditData(c);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditData(null);
    fetchCases();
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error.message}</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={handleNew} className="mb-4 bg-green-600 text-white px-4 py-2 rounded">Nouveau cas</button>
      {showForm && (
        <CaseForm initialData={editData} onSuccess={handleSuccess} />
      )}
      <ul className="divide-y">
        {cases.map(c => (
          <li key={c.id} className="flex items-center justify-between py-2">
            <span>{c.title}</span>
            <div>
              <button onClick={() => handleEdit(c)} className="mr-2 bg-yellow-500 text-white px-2 py-1 rounded">Modifier</button>
              <button onClick={() => handleDelete(c.id)} className="bg-red-600 text-white px-2 py-1 rounded">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CaseList;
