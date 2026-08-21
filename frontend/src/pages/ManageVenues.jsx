import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Building2, Plus, AlertCircle, CheckCircle, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // New venue form
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rows, setRows] = useState(5);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [premiumRows, setPremiumRows] = useState(1);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVenues = async () => {
    try {
      const res = await API.get('/venues');
      setVenues(res.data.data.venues);
    } catch (err) {
      console.error('Failed to load venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await API.post('/venues', {
        name,
        location,
        totalRows: Number(rows),
        seatsPerRow: Number(seatsPerRow),
        premiumRowsCount: Number(premiumRows),
      });

      setMessage(res.data.message);
      setName('');
      setLocation('');
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create venue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await API.delete(`/venues/${venueId}`);
      setMessage('Venue deleted successfully.');
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete venue.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0F19]">
      <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
      </Link>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Venue Management</h1>
          <p className="text-sm text-slate-400 mt-1">Configure auditorium seat matrices, row capacities, and VIP tiers</p>
        </div>
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

      {/* Two Column Layout: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Create Venue Form */}
        <div className="bg-[#151C2C] border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet-400" />
            Add New Venue
          </h2>

          <form onSubmit={handleCreateVenue} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Venue Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grand IMAX Cinema 1"
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Downtown Plaza"
                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-semibold text-slate-300 block">Total Rows</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={15}
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block">Seats/Row</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={seatsPerRow}
                  onChange={(e) => setSeatsPerRow(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-amber-400 block">VIP Rows</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={rows}
                  value={premiumRows}
                  onChange={(e) => setPremiumRows(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-3 py-2 text-amber-300 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg"
            >
              {submitting ? 'Creating Venue...' : 'Create Venue Grid'}
            </button>
          </form>
        </div>

        {/* Existing Venues Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">Configured Venues ({venues.length})</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {venues.map((v) => (
              <div key={v._id} className="bg-[#151C2C] border border-gray-800 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{v.name}</h3>
                    <p className="text-xs text-slate-400">{v.location}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteVenue(v._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-gray-800 text-slate-300">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Capacity</span>
                    <span className="font-bold text-white">{v.capacity}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Rows</span>
                    <span className="font-bold text-white">{v.totalRows}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Seats/Row</span>
                    <span className="font-bold text-white">{v.seatsPerRow}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
