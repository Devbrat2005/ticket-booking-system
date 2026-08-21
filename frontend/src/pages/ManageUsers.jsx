import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Users, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setMessage('');
    setError('');
    try {
      const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setMessage(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
        <p className="text-xs text-slate-400">Loading user records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0F19]">
      <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-white">User Accounts & Roles</h1>
        <p className="text-sm text-slate-400 mt-1">Manage user role authorization across Customer, Organiser, and Admin permissions</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[#151C2C] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Current Role</th>
                <th className="p-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-[#0B0F19]/50 transition-colors">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 font-mono text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : u.role === 'ORGANISER'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : 'bg-violet-950 text-violet-300 border border-violet-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-[#0B0F19] border border-gray-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-violet-500"
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
    </div>
  );
}
