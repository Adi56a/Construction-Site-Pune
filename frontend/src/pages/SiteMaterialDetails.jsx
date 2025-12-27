import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000/api/sites';

const emptyRow = {
  received_quantity: '',
  unit: '',
  rate_of_material: '',
  total_money_amount: 0,  // ✅ AUTO-CALCULATED (Received Qty * Rate)
  total_required_material_amount: '',
  total_required_money_amount: '',  // ✅ USER INPUT (NOT AUTO-CALCULATED)
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

  // ✅ AUTO-CALCULATE ONLY: Total Amount (Received Qty * Rate)
  const calculateRow = (row) => {
    const receivedQty = parseFloat(row.received_quantity) || 0;
    const rate = parseFloat(row.rate_of_material) || 0;

    const totalMoneyAmount = receivedQty * rate;  // ✅ ONLY THIS IS AUTO-CALCULATED

    return {
      ...row,
      total_money_amount: totalMoneyAmount.toFixed(2),
      // ✅ total_required_money_amount STAYS AS USER INPUT
    };
  };

  // Fetch existing entries
  const fetchExistingEntries = useCallback(async () => {
    if (!siteId || !materialName) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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
    const newRow = calculateRow({ ...emptyRow, id: Date.now() + Math.random() });
    setNewEntries((prev) => [...prev, newRow]);
  }, [newEntries.length]);

  const updateNewEntryCell = (rowIndex, field, value) => {
    setNewEntries((prev) => {
      const updatedRow = calculateRow({ ...prev[rowIndex], [field]: value });
      const copy = [...prev];
      copy[rowIndex] = updatedRow;
      return copy;
    });
  };

  const deleteNewRow = (rowIndex) => {
    setNewEntries((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  // ✅ CORRECTED TOTALS CALCULATION
  const calcTotals = (rows) => {
    const totalReceivedQty = rows.reduce((sum, r) => sum + (parseFloat(r.received_quantity) || 0), 0);
    const totalAmount = rows.reduce((sum, r) => sum + (parseFloat(r.total_money_amount) || 0), 0);
    const totalReqMaterial = rows.reduce((sum, r) => sum + (parseFloat(r.total_required_material_amount) || 0), 0);
    const totalReqAmount = rows.reduce((sum, r) => sum + (parseFloat(r.total_required_money_amount) || 0), 0);

    // ✅ Balance Material = Sum of Required Material - Sum of Received Qty
    const balanceMaterial = totalReqMaterial - totalReceivedQty;

    // ✅ Profit/Loss = Sum of Required Amount - Sum of Total Amount
    const profitLoss = totalReqAmount - totalAmount;

    return {
      totalReceivedQty: totalReceivedQty.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalReqMaterial: totalReqMaterial.toFixed(2),
      totalReqAmount: totalReqAmount.toFixed(2),
      balanceMaterial: balanceMaterial.toFixed(2),
      profitLoss: profitLoss.toFixed(2),
      profitLossType: profitLoss >= 0 ? 'profit' : 'loss',
    };
  };

  const existingTotals = calcTotals(existingEntries);
  const newTotals = calcTotals(newEntries);
  const grandTotals = calcTotals([...existingEntries, ...newEntries]);

  // Submit new entries
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
            total_money_amount: entry.total_money_amount,  // ✅ AUTO-CALCULATED
            total_required_material_amount: entry.total_required_material_amount || '0',  // ✅ USER INPUT
            total_required_money_amount: entry.total_required_money_amount || '0',  // ✅ USER INPUT
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
      await fetchExistingEntries();
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
    }
  };

  // Guards
  if (!materialName || !siteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No Material Selected</h1>
          <p className="text-slate-500 mb-6">Please select a material from the site materials page.</p>
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
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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

        {/* ✅ TOP SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Profit/Loss</div>
            <div className={`text-4xl font-bold ${
              grandTotals.profitLossType === 'profit' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              ₹{Math.abs(parseFloat(grandTotals.profitLoss)).toLocaleString('en-IN')}
            </div>
            <div className={`text-xs font-medium mt-1 ${
              grandTotals.profitLossType === 'profit' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {grandTotals.profitLossType === 'profit' ? '✓ Profit' : '✗ Loss'}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Balance Material</div>
            <div className="text-4xl font-bold text-blue-600">
              {parseFloat(grandTotals.balanceMaterial).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 mt-1">Total Required - Received</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Total Received</div>
            <div className="text-4xl font-bold text-indigo-600">
              {parseFloat(grandTotals.totalReceivedQty).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 mt-1">Units received</div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Existing entries table */}
          {existingEntries.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-xl font-bold text-slate-900">Existing Entries ({existingEntries.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Sr No</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Received Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rate</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Total Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Req Material</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Req Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {existingEntries.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 bg-slate-50">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.received_quantity}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.unit}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">₹{parseFloat(row.rate_of_material || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          ₹{parseFloat(row.total_money_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">{row.total_required_material_amount || 0}</td>
                        <td className="px-4 py-3 text-right text-slate-900">
                          ₹{parseFloat(row.total_required_money_amount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold">
                      <td className="px-4 py-3 text-sm bg-slate-800">TOTAL</td>
                      <td />
                      <td className="px-4 py-3 text-sm">{existingTotals.totalReceivedQty}</td>
                      <td />
                      <td />
                      <td className="px-4 py-3 text-right">₹{existingTotals.totalAmount}</td>
                      <td className="px-4 py-3 text-sm">{existingTotals.totalReqMaterial}</td>
                      <td className="px-4 py-3 text-right">₹{existingTotals.totalReqAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* New entries table */}
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Sr No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Received Qty *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Unit *</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rate *</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Req Material</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Req Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {newEntries.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 bg-slate-50">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={row.received_quantity}
                          onChange={(e) => updateNewEntryCell(idx, 'received_quantity', e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-white"
                          placeholder="0.00 *"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => updateNewEntryCell(idx, 'unit', e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-white"
                          placeholder="kg/ltr *"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={row.rate_of_material}
                          onChange={(e) => updateNewEntryCell(idx, 'rate_of_material', e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-white"
                          placeholder="0.00 *"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg bg-emerald-50 text-slate-900">
                        ₹{parseFloat(row.total_money_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={row.total_required_material_amount}
                          onChange={(e) => updateNewEntryCell(idx, 'total_required_material_amount', e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-white"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={row.total_required_money_amount}
                          onChange={(e) => updateNewEntryCell(idx, 'total_required_money_amount', e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-white"
                          placeholder="0.00"
                        />
                      </td>
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
                    <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold">
                      <td className="px-4 py-3 text-sm bg-indigo-600">NEW TOTAL</td>
                      <td className="px-4 py-3 text-sm">{newTotals.totalReceivedQty}</td>
                      <td />
                      <td />
                      <td className="px-4 py-3 text-right">₹{newTotals.totalAmount}</td>
                      <td className="px-4 py-3 text-sm">{newTotals.totalReqMaterial}</td>
                      <td className="px-4 py-3 text-right">₹{newTotals.totalReqAmount}</td>
                      <td />
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
