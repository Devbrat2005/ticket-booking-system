import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { MapPin, Plus, Trash2, Eye, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueSeats, setVenueSeats] = useState([]);

  // New venue form
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [totalRows, setTotalRows] = useState(4);
  const [seatsPerRow, setSeatsPerRow] = useState(8);
  const [premiumRowsInput, setPremiumRowsInput] = useState('A, B');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVenues = async () => {
    try {
      const res = await API.get('/venues');
      setVenues(res.data.data.venues);
    } catch (err) {
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleInspectVenue = async (venue) => {
    try {
      const res = await API.get(`/venues/${venue._id}`);
      setSelectedVenue(res.data.data.venue);
      setVenueSeats(res.data.data.seats);
    } catch (err) {
      console.error('Error fetching venue details:', err);
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const premiumRows = premiumRowsInput.split(',').map((r) => r.trim().toUpperCase());

      await API.post('/venues', {
        name,
        location,
        description,
        seatLayout: {
          totalRows: Number(totalRows),
          seatsPerRow: Number(seatsPerRow),
          categoryConfig: [
            { category: 'Premium', rows: premiumRows },
            { category: 'Standard', rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].filter((r) => !premiumRows.includes(r)) },
          ],
        },
      });

      setSuccess('Venue and physical seat grid created successfully!');
      setShowModal(false);
      setName('');
      setLocation('');
      setDescription('');
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
      setSuccess('Venue deleted successfully.');
      fetchVenues();
      if (selectedVenue && selectedVenue._id === venueId) {
        setSelectedVenue(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Dashboard
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Manage Venues & Seat Grids</h1>
          <p className="text-sm text-slate-400">Configure physical seat layouts, categories, and row boundaries</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl shadow-amber-600/20 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Venue
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <div key={venue._id} className="glass-panel p-6 rounded-2xl space-y-4 border-slate-800 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{venue.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                {venue.location}
              </p>
              <p className="text-xs text-slate-300 line-clamp-2">{venue.description}</p>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1 font-mono text-slate-300 mt-2">
                <div className="flex justify-between">
                  <span>Layout Dimensions:</span>
                  <span className="text-amber-400">{venue.seatLayout?.totalRows} Rows × {venue.seatLayout?.seatsPerRow} Seats</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Physical Capacity:</span>
                  <span className="text-emerald-400 font-bold">{venue.seatLayout?.totalRows * venue.seatLayout?.seatsPerRow} Seats</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => handleInspectVenue(venue)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <Eye className="w-4 h-4" />
                Inspect Layout Grid
              </button>

              <button
                onClick={() => handleDeleteVenue(venue._id)}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inspect Venue Seat Layout Modal */}
      {selectedVenue && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 relative shadow-2xl">
            <button onClick={() => setSelectedVenue(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              ✕
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Physical Venue Seat Matrix</span>
              <h2 className="text-2xl font-bold text-white">{selectedVenue.name}</h2>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl max-h-96 overflow-y-auto space-y-2">
              <div className="text-center font-mono text-[10px] text-slate-400 mb-4 pb-2 border-b border-slate-800">
                STAGE / SCREEN AREA
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {venueSeats.map((seat) => (
                  <div
                    key={seat._id}
                    className={`p-2 rounded-xl text-center border font-mono text-xs ${
                      seat.category === 'Premium'
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="block font-bold">{seat.label}</span>
                    <span className="text-[9px] opacity-70 block">{seat.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Venue Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              ✕
            </button>

            <h2 className="text-xl font-bold text-white">Create Venue & Configure Seat Grid</h2>

            <form onSubmit={handleCreateVenue} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block">Venue Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Grand Theater Hall"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white mt-1"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block">Location Address</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Downtown Complex, Gate 4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block">Total Rows (e.g. 4 = A,B,C,D)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={totalRows}
                    onChange={(e) => setTotalRows(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block">Seats Per Row (e.g. 8)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={seatsPerRow}
                    onChange={(e) => setSeatsPerRow(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-amber-400 font-semibold block">Premium Row Letters (Comma Separated)</label>
                <input
                  type="text"
                  value={premiumRowsInput}
                  onChange={(e) => setPremiumRowsInput(e.target.value)}
                  placeholder="A, B"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white mt-1 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg"
              >
                {submitting ? 'Generating Grid...' : 'Generate Seat Layout & Save Venue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
