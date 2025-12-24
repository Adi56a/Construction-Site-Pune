// src/pages/SiteMaterials.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SiteMaterials = () => {
  const navigate = useNavigate();
  const [siteId, setSiteId] = useState(null);
  const [siteDetails, setSiteDetails] = useState({
    ownerName: '',
    location: '',
    contactNumber: '',
    dateOfCreation: '',
    type: '',
  });
  const [materials, setMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [materialSelected, setMaterialSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // ... all useEffect and handler functions remain exactly the same ...
  // Read site details from localStorage once
  useEffect(() => {
    try {
      const storedSite = localStorage.getItem('selectedSite');
      if (storedSite) {
        const parsed = JSON.parse(storedSite);
        setSiteId(parsed.id);
        
        setSiteDetails({
          ownerName: parsed.ownerName || '',
          location: parsed.location || '',
          contactNumber: parsed.contactNumber || '',
          dateOfCreation: parsed.dateOfCreation || '',
          type: parsed.type || '',
        });
      }
    } catch (err) {
      console.error('Error reading site from localStorage', err);
    }
  }, []);

  // Fetch all available materials for suggestions
  useEffect(() => {
    const fetchAllMaterials = async () => {
      try {
        setSuggestionsLoading(true);
        const res = await fetch('http://localhost:3000/api/sites/getAllMaterialList');
        const data = await res.json();

        if (res.ok) {
          setAllMaterials(data.materialList?.materialNames || []);
        }
      } catch (error) {
        console.error('Error fetching all materials:', error);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchAllMaterials();
  }, []);

  // Fetch materials for this site
  useEffect(() => {
    if (!siteId) {
      setLoading(false);
      return;
    }

    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3000/api/sites/getSiteMaterial/${siteId}`
        );
        const data = await res.json();

        if (res.ok) {
          setMaterials(data.siteMaterial || []);
        } else {
          setSubmitStatus({ type: 'error', message: data.message || 'Failed to load materials.' });
        }
      } catch (error) {
        console.error(error);
        setSubmitStatus({ type: 'error', message: 'Server error. Could not fetch materials.' });
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [siteId]);

  // Filter and sort suggestions based on input
  const filterSuggestions = useCallback((query) => {
    if (!query.trim()) {
      setFilteredSuggestions(allMaterials.slice(0, 8));
      return;
    }

    const filtered = allMaterials
      .filter(material => 
        material.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);

    setFilteredSuggestions(filtered);
  }, [allMaterials]);

  const handleInputFocus = () => {
    setShowSuggestions(true);
    filterSuggestions(newMaterial);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMaterial(value);
    if (!materialSelected) {
      filterSuggestions(value);
    }
  };

  const handleSuggestionClick = (material) => {
    setNewMaterial(material);
    setMaterialSelected(true);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!siteId) {
      setSubmitStatus({ type: 'error', message: 'Site id not found in localStorage.' });
      return;
    }

    const name = newMaterial.trim();
    if (!name || !allMaterials.includes(name)) {
      setSubmitStatus({ type: 'error', message: 'Please select a material from the suggestions.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/api/sites/addMaterialToSite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          material_name: name,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitStatus({ type: 'success', message: data.message || 'Material added successfully.' });
        if (Array.isArray(data.siteMaterial)) {
          setMaterials(data.siteMaterial);
        } else {
          setMaterials((prev) => [...prev, name]);
        }
        // Reset form
        setNewMaterial('');
        setMaterialSelected(false);
        setShowSuggestions(false);
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Could not add material.' });
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus({ type: 'error', message: 'Server error. Could not add material.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle material click - store in localStorage and redirect
  const handleMaterialClick = (materialName) => {
    try {
      localStorage.setItem('MaterialName', JSON.stringify({ name: materialName }));
      navigate('/site-material-details');
    } catch (error) {
      console.error('Error storing material or navigating:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Site Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-sky-900 mb-2">Site Materials</h1>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="font-semibold text-sky-900">{siteDetails.ownerName || 'Site Name'}</p>
                    <p className="text-sm text-sky-600">Site ID: {siteId}</p>
                  </div>
                </div>
                {siteDetails.location && (
                  <p className="flex items-center gap-2 text-sky-600 pl-8">
                    <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {siteDetails.location}
                  </p>
                )}
                {siteDetails.contactNumber && (
                  <p className="flex items-center gap-2 text-sky-600 pl-8">
                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +91 {siteDetails.contactNumber}
                  </p>
                )}
                {siteDetails.type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200 ml-8">
                    {siteDetails.type.charAt(0).toUpperCase() + siteDetails.type.slice(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="inline-flex items-center rounded-full bg-sky-100 px-4 py-2 text-sky-700 text-sm font-semibold border border-sky-200">
              <span className="w-2 h-2 bg-sky-500 rounded-full mr-2" />
              {materials.length} materials
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Material Form - Left Side */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 p-8">
            {submitStatus && (
              <div
                className={`mb-6 p-4 rounded-xl border-l-4 text-sm font-medium ${
                  submitStatus.type === 'success'
                    ? 'bg-sky-50 border-sky-400 text-sky-800'
                    : 'bg-red-50 border-red-400 text-red-800'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative" ref={suggestionsRef}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={materialSelected ? newMaterial : "Click to see material suggestions..."}
                  value={newMaterial}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  disabled={isSubmitting || suggestionsLoading || materialSelected}
                  className={`w-full px-4 py-3 rounded-xl border-2 text-sm shadow-sm pr-10 transition-colors ${
                    materialSelected
                      ? 'bg-sky-50 border-sky-300 cursor-not-allowed text-sky-800 font-medium'
                      : 'border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:border-sky-300'
                  }`}
                />
                {suggestionsLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && !materialSelected && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-sky-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredSuggestions.map((material, index) => (
                    <button
                      key={`${material}-${index}`}
                      type="button"
                      onMouseDown={() => handleSuggestionClick(material)}
                      className="w-full px-4 py-3 text-left hover:bg-sky-50 hover:text-sky-900 text-sm font-medium transition-colors border-b border-sky-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <span>{material}</span>
                        {newMaterial.toLowerCase() === material.toLowerCase() && (
                          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {materialSelected && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-800 font-medium flex items-center justify-between">
                  <span>✓ {newMaterial} selected</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMaterial('');
                      setMaterialSelected(false);
                      inputRef.current?.focus();
                    }}
                    className="text-sky-700 hover:text-sky-900 font-medium text-xs"
                  >
                    Change
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !newMaterial.trim() || !allMaterials.includes(newMaterial.trim()) || !materialSelected}
                className={`w-full px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 ${
                  isSubmitting || !newMaterial.trim() || !allMaterials.includes(newMaterial.trim()) || !materialSelected
                    ? 'bg-sky-300 text-sky-500 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200 hover:shadow-md'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Selected Material'
                )}
              </button>
            </form>
          </div>

          {/* Scrollable Materials List - Right Side */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 p-8">
            <h2 className="text-xl font-semibold text-sky-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Site Materials ({materials.length})
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-sky-600">Loading materials...</p>
                </div>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-sky-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p className="text-lg font-semibold text-sky-900 mb-1">No materials yet</p>
                <p className="text-sm text-sky-600">Add your first material using the form above</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {materials.map((material, idx) => (
                  <button
                    key={`${material}-${idx}`}
                    onClick={() => handleMaterialClick(material)}
                    className="group w-full p-4 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-300 hover:bg-white hover:shadow-sm transition-all duration-200 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-4V7m8 4h-4m0 0l-4-4m4 4l-4 4M8 21l4-4 4 4M3 4h4m0 0l-4 4m4-4v10l-4 4" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-sky-900 group-hover:text-sky-700 text-sm">
                        {material}
                      </h3>
                    </div>
                    <svg className="w-4 h-4 text-sky-500 group-hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteMaterials;
