// src/pages/FlatPaymentEntries.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const FlatPaymentEntries = () => {
  const navigate = useNavigate();
  const [buildingId, setBuildingId] = useState(localStorage.getItem('buildingId') || '');
  const [buildingName, setBuildingName] = useState(localStorage.getItem('buildingName') || 'No Building Selected');
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [newEntry, setNewEntry] = useState({
    owner_name: '', mobile_number: '', flat_number: '', deposit: '', rent: '', date: ''
  });
  const [mobileSuggestions, setMobileSuggestions] = useState([]);
  const [ownerSuggestions, setOwnerSuggestions] = useState([]);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);
  const [flatRevenue, setFlatRevenue] = useState({ totalRent: 0, currentMonthRent: 0 });
  const mobileInputRef = useRef(null);
  const ownerInputRef = useRef(null);
  const formRef = useRef(null);

  const uniqueFlats = Array.from(new Set(entries.map(entry => entry.flat_number))).sort();

  // Smooth form animation refs
  const formHeightRef = useRef(0);

  useEffect(() => {
    if (buildingId) fetchEntries();
  }, [buildingId]);

  // Sort entries by date (NEWEST FIRST) when entries change
  useEffect(() => {
    const sortedEntries = [...entries].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Newest first
    });
    setEntries(sortedEntries);
  }, []);

  useEffect(() => {
    let filtered = entries;
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry =>
        entry.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.mobile_number.includes(searchQuery) ||
        entry.flat_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedFlat) {
      filtered = filtered.filter(entry => entry.flat_number === selectedFlat);
    }
    // Maintain newest-first order in filtered results
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    setFilteredEntries(filtered);
  }, [entries, searchQuery, selectedFlat]);

  // Calculate flat revenue when selectedFlat changes
  useEffect(() => {
    if (selectedFlat && entries.length > 0) {
      const flatEntries = entries.filter(entry => entry.flat_number === selectedFlat);
      const totalRent = flatEntries.reduce((sum, entry) => sum + Number(entry.rent || 0), 0);
      
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentMonthRent = flatEntries
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() + 1 === currentMonth && entryDate.getFullYear() === currentYear;
        })
        .reduce((sum, entry) => sum + Number(entry.rent || 0), 0);

      setFlatRevenue({ totalRent, currentMonthRent });
    } else {
      setFlatRevenue({ totalRent: 0, currentMonthRent: 0 });
    }
  }, [selectedFlat, entries]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/rent/get-building/${buildingId}`);
      const data = await res.json();
      if (res.ok) {
        // Sort by date (NEWEST FIRST) immediately after fetch
        const sortedEntries = (data.building?.RentDetailsId || []).sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });
        setEntries(sortedEntries);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mobile number suggestions
  const handleMobileChange = useCallback((e) => {
    const value = e.target.value;
    setNewEntry(prev => ({ ...prev, mobile_number: value }));

    if (value.length >= 3) {
      const suggestions = Array.from(new Set(
        entries
          .filter(entry => entry.mobile_number.includes(value))
          .map(entry => entry.mobile_number)
          .slice(0, 5)
      ));
      setMobileSuggestions(suggestions);
      setShowMobileSuggestions(true);
    } else {
      setMobileSuggestions([]);
      setShowMobileSuggestions(false);
    }
  }, [entries]);

  // Owner name suggestions
  const handleOwnerChange = useCallback((e) => {
    const value = e.target.value;
    setNewEntry(prev => ({ ...prev, owner_name: value }));

    if (value.length >= 2) {
      const suggestions = Array.from(new Set(
        entries
          .filter(entry => entry.owner_name.toLowerCase().includes(value.toLowerCase()))
          .map(entry => entry.owner_name)
          .slice(0, 5)
      ));
      setOwnerSuggestions(suggestions);
      setShowOwnerSuggestions(true);
    } else {
      setOwnerSuggestions([]);
      setShowOwnerSuggestions(false);
    }
  }, [entries]);

  const selectMobileSuggestion = (mobile) => {
    setNewEntry(prev => ({ ...prev, mobile_number: mobile }));
    setShowMobileSuggestions(false);
    if (mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  };

  const selectOwnerSuggestion = (ownerName) => {
    setNewEntry(prev => ({ ...prev, owner_name: ownerName }));
    setShowOwnerSuggestions(false);
    if (ownerInputRef.current) {
      ownerInputRef.current.focus();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile_number') {
      handleMobileChange(e);
    } else if (name === 'owner_name') {
      handleOwnerChange(e);
    } else {
      setNewEntry(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/rent/add-rent-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEntry, buildingId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setNewEntry({ owner_name: '', mobile_number: '', flat_number: '', deposit: '', rent: '', date: '' });
        setMobileSuggestions([]);
        setOwnerSuggestions([]);
        setShowMobileSuggestions(false);
        setShowOwnerSuggestions(false);
        fetchEntries(); // Refetches and auto-sorts newest first
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleForm = () => {
    setShowForm(prev => {
      if (!prev) {
        setTimeout(() => {
          if (formRef.current) {
            formHeightRef.current = formRef.current.scrollHeight;
          }
        }, 10);
      }
      return !prev;
    });
  };

  if (!buildingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-md text-center mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Building Selected</h2>
          <p className="text-gray-600 mb-8 text-lg">Please select a building first</p>
          <button
            onClick={() => navigate('/rent')}
            className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            ← Select Building
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{buildingName}</h1>
              <p className="text-sm text-gray-600">Flat Payment Records • {entries.length} total entries • <span className="font-semibold text-sky-600">Newest First</span></p>
            </div>
            <button
              onClick={toggleForm}
              className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              {showForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hide Form
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Entry
                </>
              )}
            </button>
          </div>
        </div>

        {/* Smooth Animated Form */}
        <div 
          className={`overflow-hidden rounded-2xl border border-gray-200 shadow-sm mb-8 transition-all duration-500 ease-out ${
            showForm ? 'max-h-[2000px] opacity-100 bg-white p-8' : 'max-h-0 opacity-0'
          }`}
          ref={formRef}
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner Name with Suggestions */}
              <div className="space-y-2 relative">
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <input 
                  ref={ownerInputRef}
                  name="owner_name" 
                  value={newEntry.owner_name} 
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 pr-10"
                  placeholder="Enter owner name" 
                />
                {showOwnerSuggestions && ownerSuggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-auto">
                    {ownerSuggestions.map((ownerName, index) => (
                      <div
                        key={index}
                        onClick={() => selectOwnerSuggestion(ownerName)}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-gray-900"
                      >
                        {ownerName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Number with Suggestions */}
              <div className="space-y-2 relative">
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input 
                  ref={mobileInputRef}
                  name="mobile_number" 
                  value={newEntry.mobile_number} 
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 pr-10"
                  placeholder="9876543210" 
                />
                {showMobileSuggestions && mobileSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-auto">
                    {mobileSuggestions.map((mobile, index) => (
                      <div
                        key={index}
                        onClick={() => selectMobileSuggestion(mobile)}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-gray-900"
                      >
                        {mobile}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Flat Number</label>
                <input name="flat_number" value={newEntry.flat_number} onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  placeholder="101" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Move-in Date</label>
                <input name="date" type="date" value={newEntry.date} onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Security Deposit (₹)</label>
                <input name="deposit" type="number" value={newEntry.deposit} onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  placeholder="15000" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Monthly Rent (₹)</label>
                <input name="rent" type="number" value={newEntry.rent} onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  placeholder="3500" />
              </div>
              <button type="submit"
                className="md:col-span-2 w-full py-4 px-8 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                Add Payment Entry
              </button>
            </form>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Controls */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
                <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                  {filteredEntries.length} of {entries.length} entries
                </div>
                {uniqueFlats.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedFlat('')} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        !selectedFlat 
                          ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}>
                      All Flats
                    </button>
                    {uniqueFlats.slice(0, 8).map(flat => (
                      <button 
                        key={flat} 
                        onClick={() => setSelectedFlat(flat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                          selectedFlat === flat 
                            ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm scale-105' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105'
                        }`}>
                        Flat {flat}
                      </button>
                    ))}
                    {uniqueFlats.length > 8 && (
                      <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                        +{uniqueFlats.length - 8} more
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Flat Revenue Display */}
              {selectedFlat && (
                <div className="text-right bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Flat {selectedFlat} Revenue (Rent Only)</p>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-sky-600">
                      ₹{flatRevenue.totalRent.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Current Month: ₹{flatRevenue.currentMonthRent.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative w-full max-w-md sm:w-80">
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search owner, mobile, or flat..."
                  className="w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-gray-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-lg font-semibold text-gray-900">Loading entries...</p>
                </div>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-24">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
                </svg>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {searchQuery || selectedFlat ? 'No matching entries' : 'No entries yet'}
                </h3>
                <p className="text-lg text-gray-600 max-w-lg mx-auto">
                  {searchQuery ? 'Try adjusting your search terms' : 
                   selectedFlat ? `No entries for Flat ${selectedFlat}` : 
                   'Add your first payment entry using the button above'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Owner</th>
                    <th className="text-left px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Mobile</th>
                    <th className="text-left px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Flat</th>
                    <th className="text-right px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Deposit</th>
                    <th className="text-right px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Rent</th>
                    <th className="text-left px-8 py-5 font-semibold text-sm text-gray-900 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-8 py-6 font-medium text-gray-900">{entry.owner_name}</td>
                      <td className="px-8 py-6 text-sm text-gray-700">{entry.mobile_number}</td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border">
                          Flat {entry.flat_number}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-semibold text-gray-900 text-lg">
                        ₹{Number(entry.deposit).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div>
                          <span className="font-semibold text-lg text-gray-900">₹{Number(entry.rent).toLocaleString()}</span>
                          <span className="text-xs text-gray-500 block">/month</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-700 font-medium">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlatPaymentEntries;
