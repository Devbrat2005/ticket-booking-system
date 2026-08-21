import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Users, Shield, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data.users);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setMessage('');
    setError('');

    try {
      const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setMessage(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-white">User Accounts & Role Permissions</h1>
        <p className="text-sm text-slate-400">View platform users and grant Organiser/Admin privileges</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-4 rounded-l-xl">User Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Current Role</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right rounded-r-xl">Actions / Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold">
                    {u.name.charAt(0)}
                  </div>
                  {u.name}
                </td>
                <td className="p-4 font-mono text-slate-400">{u.email}</td>
                <td className="p-4 font-mono font-bold">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : u.role === 'ORGANISER'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-slate-400 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <select
                    disabled={updatingId === u._id}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ORGANISER">ORGANISER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
