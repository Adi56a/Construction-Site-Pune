// src/pages/Expense.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Expense = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedBuildingName, setSelectedBuildingName] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQueryBuildings, setSearchQueryBuildings] = useState('');
  const [searchQueryExpenses, setSearchQueryExpenses] = useState('');
  const [newExpense, setNewExpense] = useState({
    date: '',
    name: '',
    amount: '',
    reason_of_expense: '',
    total_amount: ''
  });

  // Fetch all buildings on mount
  useEffect(() => {
    fetchBuildings();
  }, []);

  // Filter buildings based on search
  useEffect(() => {
    if (!searchQueryBuildings.trim()) {
      setFilteredBuildings(buildings);
    } else {
      const filtered = buildings.filter(building =>
        building.buildingName.toLowerCase().includes(searchQueryBuildings.toLowerCase()) ||
        building.location.toLowerCase().includes(searchQueryBuildings.toLowerCase())
      );
      setFilteredBuildings(filtered);
    }
  }, [buildings, searchQueryBuildings]);

  // Fetch expenses when building is selected
  useEffect(() => {
    if (selectedBuildingId) {
      fetchExpenses();
    } else {
      setExpenses([]);
      setFilteredExpenses([]);
    }
  }, [selectedBuildingId]);

  // Filter expenses based on search
  useEffect(() => {
    let filtered = expenses;
    if (searchQueryExpenses.trim()) {
      filtered = filtered.filter(expense =>
        expense.name.toLowerCase().includes(searchQueryExpenses.toLowerCase()) ||
        expense.reason_of_expense.toLowerCase().includes(searchQueryExpenses.toLowerCase())
      );
    }
    setFilteredExpenses(filtered);
  }, [expenses, searchQueryExpenses]);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/rent/get-rent-buildings');
      const data = await res.json();
      if (res.ok) {
        setBuildings(data.buildings || []);
        setFilteredBuildings(data.buildings || []);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const res = await fetch(`http://localhost:3000/api/rent/get-building-expenses/${selectedBuildingId}`);
      const data = await res.json();
      if (res.ok) {
        setExpenses(data.building?.ExpenseIds || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleBuildingClick = (building) => {
    setSelectedBuildingId(building._id);
    setSelectedBuildingName(building.buildingName);
    setShowForm(false);
    setSearchQueryExpenses('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/rent/create-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newExpense, buildingId: selectedBuildingId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setNewExpense({ date: '', name: '', amount: '', reason_of_expense: '', total_amount: '' });
        fetchExpenses();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg font-semibold text-gray-900">Loading buildings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Building Expenses</h1>
              <p className="text-sm text-gray-600">Manage expenses across all buildings</p>
            </div>
          </div>
        </div>

        {/* Buildings Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                All Buildings ({filteredBuildings.length})
              </h2>
              <div className="relative max-w-md">
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={searchQueryBuildings}
                  onChange={(e) => setSearchQueryBuildings(e.target.value)}
                  placeholder="Search buildings by name or location..."
                  className="w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {filteredBuildings.length === 0 ? (
            <div className="text-center py-24">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {searchQueryBuildings ? 'No matching buildings' : 'No buildings found'}
              </h3>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                {searchQueryBuildings ? 'Try adjusting your search terms' : 'Create your first building to get started'}
              </p>
            </div>
          ) : (
            <div className="p-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBuildings.map((building) => (
                <div
                  key={building._id}
                  className={`group p-6 rounded-xl border hover:border-sky-300 hover:shadow-md transition-all duration-200 cursor-pointer ${
                    selectedBuildingId === building._id 
                      ? 'border-sky-500 bg-sky-50 shadow-md ring-2 ring-sky-200' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleBuildingClick(building)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-sky-800 truncate">
                        {building.buildingName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 truncate">{building.location}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          {building.ExpenseIds?.length || 0} expenses
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Building Content */}
        {selectedBuildingId && (
          <div>
            {/* Selected Building Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedBuildingName}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Expense Records</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                      {expenses.length} expenses
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-6 py-2.5 bg-white border-2 border-sky-200 hover:border-sky-300 text-sky-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:bg-sky-50 group ${
                      showForm ? 'border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50' : ''
                    }`}
                  >
                    <svg className={`w-4 h-4 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{showForm ? 'Hide Form' : 'Add Expense'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBuildingId('');
                      setSelectedBuildingName('');
                      setExpenses([]);
                      setShowForm(false);
                    }}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Change Building
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible Form */}
            {showForm && (
              <div className="animate-formSlide bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-500 ease-out">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-sky-50/50">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    New Expense Entry - {selectedBuildingName}
                  </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input name="date" type="date" value={newExpense.date} onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-gray-300 transition-all duration-200 shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Expense Name</label>
                    <input name="name" value={newExpense.name} onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-gray-300 transition-all duration-200 shadow-sm"
                      placeholder="Electricity Bill" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                    <input name="amount" type="number" value={newExpense.amount} onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-gray-300 transition-all duration-200 shadow-sm"
                      placeholder="150" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Total Amount (₹)</label>
                    <input name="total_amount" type="number" value={newExpense.total_amount} onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-gray-300 transition-all duration-200 shadow-sm"
                      placeholder="150" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Reason for Expense</label>
                    <textarea name="reason_of_expense" value={newExpense.reason_of_expense} onChange={handleInputChange}
                      rows="3"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-gray-300 transition-all duration-200 shadow-sm resize-vertical"
                      placeholder="Enter reason for this expense..." />
                  </div>
                  <button type="submit"
                    className="md:col-span-2 w-full py-4 px-8 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Add Expense to {selectedBuildingName}
                  </button>
                </form>
              </div>
            )}

            {/* Expenses Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                      {filteredExpenses.length} of {expenses.length} expenses
                    </div>
                  </div>
                  <div className="relative w-full max-w-md sm:w-80">
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={searchQueryExpenses}
                      onChange={(e) => setSearchQueryExpenses(e.target.value)}
                      placeholder="Search expense name or reason..."
                      className="w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loadingExpenses ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-gray-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-6"></div>
                      <p className="text-lg font-semibold text-gray-900">Loading expenses...</p>
                    </div>
                  </div>
                ) : filteredExpenses.length === 0 ? (
                  <div className="text-center py-24">
                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
                    </svg>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {searchQueryExpenses ? 'No matching expenses' : 'No expenses yet'}
                    </h3>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto">
                      {searchQueryExpenses ? 'Try adjusting your search terms' : `Add your first expense for ${selectedBuildingName}`}
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Date</th>
                        <th className="text-left px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Expense Name</th>
                        <th className="text-left px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Amount</th>
                        <th className="text-right px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Total</th>
                        <th className="text-left px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredExpenses.map((expense) => (
                        <tr key={expense._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-8 py-6 text-sm text-gray-900 font-medium">
                            {new Date(expense.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-semibold text-gray-900">{expense.name}</div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-700 font-medium">
                            ₹{Number(expense.amount).toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="font-bold text-lg text-gray-900">
                              ₹{Number(expense.total_amount).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-600 max-w-md truncate">
                            {expense.reason_of_expense}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes formSlide {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-formSlide {
          animation: formSlide 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export default Expense;
