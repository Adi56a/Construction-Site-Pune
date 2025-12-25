// src/pages/AddRentBuilding.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AddRentBuilding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ buildingName: '', location: '' });
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBuildings(buildings);
    } else {
      const filtered = buildings.filter(building =>
        building.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBuildings(filtered);
    }
  }, [buildings, searchQuery]);

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

  const handleBuildingClick = (building) => {
    localStorage.setItem('buildingId', building._id);
    localStorage.setItem('buildingName', building.buildingName);
    navigate('/flat-payment-entries');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.buildingName.trim()) newErrors.buildingName = 'Building name is required.';
    if (!formData.location.trim()) newErrors.location = 'Location is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch('http://localhost:3000/api/rent/add-rent-building', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitStatus({ type: 'success', message: data.message || 'Building added successfully!' });
        setFormData({ buildingName: '', location: '' });
        fetchBuildings();
        setTimeout(() => setShowForm(false), 1500);
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Failed to add building.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setShowForm(prev => !prev);
  };

  if (loading && buildings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Loading buildings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Rent Buildings</h1>
              <p className="text-lg text-gray-600">Manage your rental properties</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                {buildings.length} buildings
              </div>
              <button
                onClick={toggleForm}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
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
                    Add Building
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Animated Form */}
        <div
          ref={formRef}
          className={`overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 transition-all duration-500 ease-in-out ${
            showForm ? 'max-h-96 p-8 opacity-100' : 'max-h-0 p-0 opacity-0'
          }`}
        >
          {showForm && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
              {submitStatus && (
                <div className={`md:col-span-2 p-4 rounded-xl border-l-4 flex items-center gap-3 text-sm font-medium ${
                  submitStatus.type === 'success'
                    ? 'bg-blue-50 border-blue-400 text-blue-800'
                    : 'bg-red-50 border-red-400 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    submitStatus.type === 'success' ? 'bg-blue-500' : 'bg-red-500'
                  }`} />
                  {submitStatus.message}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="buildingName"
                  value={formData.buildingName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                    errors.buildingName
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  placeholder="Sunrise Apartments"
                />
                {errors.buildingName && (
                  <p className="text-xs text-red-600 mt-1">{errors.buildingName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                    errors.location
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  placeholder="Sector 45, Noida"
                />
                {errors.location && (
                  <p className="text-xs text-red-600 mt-1">{errors.location}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`md:col-span-2 w-full py-4 px-8 rounded-xl font-semibold text-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Add Building
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Buildings List - Full Width Cards */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                All Buildings {searchQuery && `(${filteredBuildings.length})`}
              </h2>
              <div className="relative flex-1 max-w-md">
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or location..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="p-0">
            {loading && filteredBuildings.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-lg font-semibold text-gray-900">Loading buildings...</p>
                </div>
              </div>
            ) : filteredBuildings.length === 0 ? (
              <div className="text-center py-24">
                <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {searchQuery ? 'No matching buildings' : 'No buildings yet'}
                </h3>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  {searchQuery ? 'Try adjusting your search terms' : 'Add your first building above'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredBuildings.map((building) => (
                  <div
                    key={building._id}
                    className="group cursor-pointer p-8 hover:bg-gray-50 transition-all duration-300 border-b last:border-b-0 border-gray-100 hover:border-blue-200"
                    onClick={() => handleBuildingClick(building)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-all duration-200">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-2xl text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                          {building.buildingName}
                        </h3>
                        <p className="text-lg text-gray-600 mt-1">{building.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRentBuilding;
