// src/pages/Labour.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000/api/sites';

// ✅ Common Indian Labour Types
const COMMON_LABOURS = [
  'Mason',
  'Helper',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Welder',
  'Bar Bender',
  'Steel Fixer',
  'Shuttering Carpenter',
  'Tiler',
  'Labor',
  'Skilled Labor',
  'Unskilled Labor',
  'Foreman',
  'Supervisor',
  'Driver',
  'Crane Operator',
  'Excavator Operator',
  'JCB Operator',
  'Block Maker',
  'Centering Carpenter',
  'Fitter',
  'Fabricator',
  'Scaffolder'
];

const LabourList = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [labours, setLabours] = useState([]);
  const [newName, setNewName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  // Filter suggestions based on input
  const filterSuggestions = (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = COMMON_LABOURS.filter((labour) =>
      labour.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5); // Show top 5 suggestions
    setSuggestions(filtered);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewName(value);
    filterSuggestions(value);
    setShowSuggestions(true);
  };

  // Select suggestion
  const selectSuggestion = (suggestion) => {
    setNewName(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Hide suggestions
  const hideSuggestions = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Fetch labour list
  const fetchLabourList = useCallback(async () => {
    try {
      setIsLoadingList(true);
      setStatus(null);

      const res = await fetch(`${API_BASE}/getLabourList`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load labour list');
      }

      const data = await res.json();
      setLabours(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Error loading labour list' });
      setLabours([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchLabourList();
  }, [fetchLabourList]);

  // Add single labour
  const handleAddLabour = async (e) => {
    e.preventDefault();

    const trimmed = newName.trim();
    if (!trimmed) {
      setStatus({ type: 'error', message: 'Please enter a labour name.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE}/addLabourList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add labour');
      }

      setStatus({ type: 'success', message: `Labour "${trimmed}" added successfully.` });
      setNewName('');
      setSuggestions([]);

      if (Array.isArray(data.LabourList)) {
        setLabours(data.LabourList);
      } else {
        fetchLabourList();
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Error adding labour' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Labour Master</h1>
            <p className="text-sm text-slate-500">
              Manage your labour name list used across the project.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Status message */}
        {status && (
          <div
            className={`p-3 rounded-2xl text-sm font-medium border-l-4 ${
              status.type === 'success'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Add labour form */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Labour</h2>
          <form onSubmit={handleAddLabour} className="relative">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1 relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Labour name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (newName.trim()) {
                      filterSuggestions(newName);
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={hideSuggestions}
                  placeholder="Type or select common labour type (e.g. Mason, Electrician)"
                  className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50"
                  autoComplete="off"
                />
                {/* ✅ Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion}
                        onClick={() => selectSuggestion(suggestion)}
                        className="px-4 py-2.5 text-sm cursor-pointer hover:bg-indigo-50 border-b border-slate-100 last:border-b-0 text-slate-800"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="text-lg leading-none">＋</span>
                    Add to list
                  </>
                )}
              </button>
            </div>
          </form>
          <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <span>💡</span>
            <span>Common types like Mason, Electrician, Carpenter appear as suggestions. Type to filter or add new.</span>
          </p>
        </div>

        {/* Labour list */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Labour list</h2>
              <p className="text-xs text-slate-500">
                Total labours: <span className="font-semibold text-slate-700">{labours.length}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={fetchLabourList}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              Refresh
            </button>
          </div>

          {isLoadingList ? (
            <div className="py-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                <p className="text-xs text-slate-500">Loading labour list...</p>
              </div>
            </div>
          ) : labours.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No labours added yet. Use the form above to add the first labour.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider w-20">
                      Sr No
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                      Labour name
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labours.map((name, index) => (
                    <tr key={`${name}-${index}`} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-700 bg-slate-50 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 text-slate-800">
                        {name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabourList;
