import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
      localStorage.setItem('token', data.token);
      login(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Connexion</h2>
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border p-2 rounded" />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Mot de passe</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border p-2 rounded" />
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

export default Login;
