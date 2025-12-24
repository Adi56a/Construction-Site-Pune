import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000/api/sites';

const emptyRow = {
  received_quantity: '',
  unit: '',
  rate_of_material: '',
  required_money_amount: '',
  total_required_money_amount: '',
  total_required_material_amount: '',
  remaining_material_amount: '',
};

const SiteMaterialDetails = () => {
  const navigate = useNavigate();
  const [materialName, setMaterialName] = useState('');
  const [site, setSite] = useState(null);
  const [existingEntries, setExistingEntries] = useState([]);
  const [newEntries, setNewEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const tableRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedMaterial = localStorage.getItem('MaterialName');
      const storedSite = localStorage.getItem('selectedSite');

      if (storedMaterial) {
        const parsedMaterial = JSON.parse(storedMaterial);
        setMaterialName(parsedMaterial.name || '');
      }

      if (storedSite) {
        const parsedSite = JSON.parse(storedSite);
        setSite(parsedSite || null);
      }
    } catch (err) {
      console.error('Error reading from localStorage', err);
    }
  }, []);

  const siteId = site?.id;

  // Fetch existing entries - NOW PROPER GET REQUEST
  const fetchExistingEntries = useCallback(async () => {
    if (!siteId || !materialName) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // ✅ CORRECTED: GET request with query params
      const res = await fetch(
        `${API_BASE}/getMaterialDetails?siteId=${siteId}&material_name=${encodeURIComponent(materialName)}`
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data.materials)) {
        const transformed = data.materials.map((m) => ({
          id: m._id,
          ...m,
        }));
        setExistingEntries(transformed);
      } else {
        setExistingEntries([]);
      }
    } catch (err) {
      console.error('Error fetching material details', err);
      setExistingEntries([]);
    } finally {
      setLoading(false);
    }
  }, [siteId, materialName]);

  useEffect(() => {
    fetchExistingEntries();
  }, [fetchExistingEntries]);

  // Row helpers
  const addNewRow = useCallback(() => {
    if (newEntries.length >= 50) {
      setSubmitStatus({ type: 'error', message: 'Maximum 50 new entries allowed.' });
      return;
    }
    setNewEntries((prev) => [...prev, { id: Date.now() + Math.random(), ...emptyRow }]);
  }, [newEntries.length]);

  const updateNewEntryCell = (rowIndex, field, value) => {
    setNewEntries((prev) => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], [field]: value };
      return copy;
    });
  };

  const deleteNewRow = (rowIndex) => {
    setNewEntries((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  // Totals
  const calcTotals = (rows) => ({
    qty: rows.reduce((sum, r) => sum + (parseFloat(r.received_quantity) || 0), 0),
    money: rows.reduce((sum, r) => sum + (parseFloat(r.total_required_money_amount) || 0), 0),
  });

  const existingTotals = calcTotals(existingEntries);
  const newTotals = calcTotals(newEntries);

  // Submit new entries - POST (correct)
  const handleSubmit = async () => {
    if (!siteId || !materialName) {
      setSubmitStatus({ type: 'error', message: 'Missing site or material data.' });
      return;
    }

    if (newEntries.length === 0) {
      setSubmitStatus({ type: 'error', message: 'Please add at least one new entry.' });
      return;
    }

    const invalid = newEntries.some(
      (r) => !r.received_quantity || !r.unit || !r.rate_of_material
    );
    if (invalid) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill all required fields (Qty, Unit, Rate) in new entries.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      for (const entry of newEntries) {
        const res = await fetch(`${API_BASE}/addMaterialDetailsToSite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material_name: materialName,
            received_quantity: entry.received_quantity,
            unit: entry.unit,
            rate_of_material: entry.rate_of_material,
            required_money_amount: entry.required_money_amount || '',
            total_required_money_amount: entry.total_required_money_amount || '',
            total_required_material_amount: entry.total_required_material_amount || '',
            remaining_material_amount: entry.remaining_material_amount || '',
            siteId,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save entry');
      }

      setSubmitStatus({
        type: 'success',
        message: `Successfully saved ${newEntries.length} new entries!`,
      });

      setNewEntries([]);
      await fetchExistingEntries(); // refresh with GET
    } catch (err) {
      console.error(err);
      setSubmitStatus({
        type: 'error',
        message: err.message || 'Failed to save entries.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const cell = e.target;
      const next = cell.parentElement.nextSibling?.querySelector('input');
      if (next) {
        next.focus();
        next.select();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = e.target.parentElement.nextSibling?.querySelector('input');
      if (next) next.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = e.target.parentElement.previousSibling?.querySelector('input');
      if (prev) prev.focus();
    }
  };

  // Guards
  if (!materialName || !siteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No Material Selected</h1>
          <p className="text-slate-500 mb-6">
            Please select a material from the site materials page.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading material entries...</p>
        </div>
      </div>
    );
  }

  // Rest of JSX remains exactly the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Material Details</h1>
              <p className="text-xl font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl inline-block">
                {materialName}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Site: {site?.ownerName} · {site?.location}
              </p>
              <p className="text-xs text-slate-400">Site ID: {siteId}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                ← Back to Materials
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || newEntries.length === 0}
                className={`px-8 py-3 rounded-xl font-semibold text-sm shadow-lg flex items-center gap-2 transition-all ${
                  isSubmitting || newEntries.length === 0
                    ? 'bg-slate-400 cursor-not-allowed text-slate-500'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                  `Save ${newEntries.length} New Entries`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        {submitStatus && (
          <div
            className={`p-4 rounded-2xl border-l-4 text-sm font-medium ${
              submitStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-red-50 border-red-400 text-red-800'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <div className="space-y-6">
          {/* Existing entries table - SAME JSX */}
          {existingEntries.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-xl font-bold text-slate-900">Existing Entries ({existingEntries.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Received Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rate/Material</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Required Money</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Req Money</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Req Material</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Remaining Material</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {existingEntries.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 bg-slate-50">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.received_quantity}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.unit}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">₹{row.rate_of_material?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">₹{row.required_money_amount?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">₹{row.total_required_money_amount?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.total_required_material_amount}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.remaining_material_amount}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {row.transaction_date ? new Date(row.transaction_date).toLocaleDateString('en-IN') : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold">
                      <td className="px-4 py-3 text-sm bg-emerald-600">TOTAL</td>
                      <td className="px-4 py-3 text-sm">{existingTotals.qty.toFixed(2)}</td>
                      <td /><td /><td />
                      <td className="px-4 py-3 text-sm">₹{existingTotals.money.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td /><td /><td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* New entries table - SAME JSX */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">New Entries ({newEntries.length}/50)</h3>
                <button
                  onClick={addNewRow}
                  disabled={newEntries.length >= 50}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm shadow-lg flex items-center gap-2 transition-all ${
                    newEntries.length >= 50
                      ? 'bg-slate-400 cursor-not-allowed text-slate-500'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  <span className="text-lg">＋</span>Add Row
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table ref={tableRef} className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Received Qty *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Unit *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rate/Material *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Required Money</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Req Money</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Req Material</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Remaining Material</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {newEntries.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 bg-slate-50">{idx + 1}</td>
                      {[
                        'received_quantity',
                        'unit',
                        'rate_of_material',
                        'required_money_amount',
                        'total_required_money_amount',
                        'total_required_material_amount',
                        'remaining_material_amount',
                      ].map((field) => (
                        <td key={field} className="px-4 py-3">
                          <input
                            type={field === 'unit' ? 'text' : 'number'}
                            step={field === 'unit' ? undefined : '0.01'}
                            value={row[field]}
                            onChange={(e) => updateNewEntryCell(idx, field, e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                            placeholder={
                              field === 'unit'
                                ? 'kg/ltr'
                                : field === 'received_quantity' || field === 'rate_of_material'
                                ? '0.00 *'
                                : '0.00'
                            }
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteNewRow(idx)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all group-hover:bg-red-50"
                          title="Delete Row"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {newEntries.length > 0 && (
                    <tr className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold">
                      <td className="px-4 py-3 text-sm bg-emerald-600">NEW TOTAL</td>
                      <td className="px-4 py-3 text-sm">{newTotals.qty.toFixed(2)}</td>
                      <td /><td /><td />
                      <td className="px-4 py-3 text-sm">
                        ₹{newTotals.money.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td /><td /><td />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteMaterialDetails;
