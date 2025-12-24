// src/pages/AddMaterialList.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMON_MATERIALS = [
  'Cement', 'Steel Bars (TMT)', 'Sand', 'Crushed Stone', 'Brick', 'Concrete Blocks', 
  'Fly Ash Bricks', 'AAC Blocks', 'River Sand', 'M Sand', 'Coarse Aggregate', 
  'Fine Aggregate', 'Portland Cement (OPC)', 'Portland Pozzolana Cement (PPC)', 
  'Binding Wire', 'Welding Rods', 'PVC Pipes', 'CPVC Pipes', 'GI Pipes', 
  'Electrical Conduit PVC', 'Electrical Wires', 'RCC Pipes', 'HDPE Pipes', 
  'Waterproofing Chemicals', 'Plaster of Paris (POP)', 'Wall Putty', 'Primer', 
  'Distemper Paint', 'Emulsion Paint', 'Enamel Paint', 'Anti-Termite Chemical', 
  'Door Frame Wood', 'Window Frame Wood', 'Plywood', 'MDF Board', 'Flush Door', 
  'Solid Core Door', 'Ceramic Tiles', 'Vitrified Tiles', 'Marble', 'Granite', 
  'Kota Stone', 'Electrical Switches', 'Light Fittings', 'Ceiling Fan', 'Wall Fan',
  'Aluminium Section', 'UPVC Windows', 'Glass', 'Putty', 'Silicone Sealant', 
  'Structural Steel', 'MS Plates', 'MS Angles', 'MS Channels', 'Roofing Sheets',
  'Asphalt Felt', 'Bitumen', 'Epoxy Paint', 'PU Paint', 'Wood Primer', 'Teak Wood',
  'Sal Wood', 'PVC Door', 'Stainless Steel', 'Aluminium Sheets', 'Gypsum Board',
  'False Ceiling Grid', 'Acoustic Panel', 'Fire Rated Door', 'Rolling Shutter',
  'MS Grills', 'Handrails', 'Expansion Joint Filler', 'Water Stopping Tape',
  'Joint Filler', 'Curing Compound', 'Formwork Oil', 'Shuttering Plywood',
  'Mild Steel Rods', 'GP Sheets', 'CI Pipes', 'Ductile Iron Pipes'
];

const COMMON_UNITS = ['Bags', 'MT', 'Tonnes', 'Cum', 'Sqft', 'Sft', 'Nos', 'Pcs', 'Kg', 'Kgs', 'Ltr', 'Ltrs', 'mm', 'Feet', 'Running Meter', 'Rmt', 'Sqmt', 'Bundle', 'Pair', 'Set', 'Box', 'Carton', 'Packet', 'Roll'];

const AddMaterialList = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([{ name: '', unit: '' }]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState({});
  const [filteredSuggestions, setFilteredSuggestions] = useState({});
  const inputRefs = useRef({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/sites/getAllMaterialList');
      const data = await res.json();
      if (res.ok) {
        setAllMaterials(data.materialList?.materialNames || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSuggestions = useCallback((query, index) => {
    if (!query.trim()) {
      setFilteredSuggestions(prev => ({ ...prev, [index]: [] }));
      return;
    }
    const filtered = COMMON_MATERIALS
      .filter(material => material.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);
    setFilteredSuggestions(prev => ({ ...prev, [index]: filtered }));
  }, []);

  const handleInputFocus = (index) => {
    setShowSuggestions(prev => ({ ...prev, [index]: true }));
    filterSuggestions(materials[index].name, index);
  };

  const handleMaterialInputChange = (index, value) => {
    const updated = materials.map((item, i) => i === index ? { ...item, name: value } : item);
    setMaterials(updated);
    filterSuggestions(value, index);
  };

  const handleSuggestionClick = (index, material) => {
    const updated = materials.map((item, i) => i === index ? { ...item, name: material } : item);
    setMaterials(updated);
    setShowSuggestions(prev => ({ ...prev, [index]: false }));
  };

  const addMaterialRow = () => setMaterials([...materials, { name: '', unit: '' }]);
  const removeMaterialRow = (index) => {
    if (materials.length > 1) {
      const updated = materials.filter((_, i) => i !== index);
      setMaterials(updated);
      setShowSuggestions(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = materials.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setMaterials(updated);
  };

  const validateMaterials = () => {
    for (let i = 0; i < materials.length; i++) {
      if (!materials[i].name.trim()) return `Material name is required for row ${i + 1}`;
      if (!materials[i].unit.trim()) return `Unit is required for row ${i + 1}`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateMaterials();
    if (validationError) {
      setSubmitStatus({ type: 'error', message: validationError });
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const materialNames = materials.map(m => m.name.trim());
      const materialUnits = materials.map(m => m.unit.trim());
      const res = await fetch('http://localhost:3000/api/sites/addMaterialList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialNames, materialUnits }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus({ type: 'success', message: data.message });
        fetchMaterials();
        setMaterials([{ name: '', unit: '' }]);
      } else {
        setSubmitStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-sky-900 mb-2">Material Master List</h1>
              <p className="text-lg text-sky-600">Add construction materials and their standard units</p>
            </div>
            <div className="inline-flex items-center rounded-full bg-sky-100 px-4 py-2 text-sky-700 text-sm font-semibold border border-sky-200">
              <span className="w-2 h-2 bg-sky-500 rounded-full mr-2" />
              {allMaterials.length} materials
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 p-8">
            {submitStatus && (
              <div className={`mb-6 p-4 rounded-xl border-l-4 text-sm font-medium flex items-center ${
                submitStatus.type === 'success' ? 'bg-sky-50 border-sky-400 text-sky-800' : 'bg-red-50 border-red-400 text-red-800'
              }`}>
                <svg className={`w-5 h-5 mr-3 ${submitStatus.type === 'success' ? 'text-sky-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  {submitStatus.type === 'success' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {materials.map((material, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end p-4 bg-sky-50/30 rounded-xl border border-sky-200">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-sky-700 mb-2">Material Name <span className="text-red-500">*</span></label>
                      <input
                        ref={el => { if (el) inputRefs.current[index] = el; }}
                        type="text"
                        value={material.name}
                        onChange={(e) => handleMaterialInputChange(index, e.target.value)}
                        onFocus={() => handleInputFocus(index)}
                        placeholder="Type material name..."
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-sky-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                      />
                      <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {showSuggestions[index] && filteredSuggestions[index]?.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-sky-200 rounded-xl shadow-md max-h-48 overflow-auto top-full left-0">
                          {filteredSuggestions[index].map((suggestion, sIndex) => (
                            <button
                              key={`${suggestion}-${sIndex}`}
                              type="button"
                              onClick={() => handleSuggestionClick(index, suggestion)}
                              className="w-full px-4 py-2.5 text-left hover:bg-sky-50 text-sm border-b border-sky-100 last:border-b-0"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-sky-700 mb-2">Unit <span className="text-red-500">*</span></label>
                      <select
                        value={material.unit}
                        onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-sky-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm"
                      >
                        <option value="">Select unit...</option>
                        {COMMON_UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMaterialRow(index)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors self-end"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addMaterialRow}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-xl hover:shadow-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Material
              </button>
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-sky-300 text-sky-500 cursor-not-allowed'
                      : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Material List
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-sky-200 bg-white hover:bg-sky-50 text-sky-700 font-semibold rounded-xl hover:shadow-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 p-8">
            <h2 className="text-xl font-semibold text-sky-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Existing Materials ({allMaterials.length})
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-sky-600">Loading...</p>
              </div>
            ) : allMaterials.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <svg className="w-16 h-16 text-sky-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
                </svg>
                <p className="font-semibold text-sky-900">No materials added</p>
                <p className="text-sm text-sky-600">Add materials using the form</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {allMaterials.slice(0, 50).map((material, idx) => (
                  <div key={`${material}-${idx}`} className="p-4 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-300 hover:bg-white hover:shadow-sm transition-colors text-sm flex items-center gap-3 cursor-default">
                    <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4" />
                      </svg>
                    </div>
                    <span className="font-medium text-sky-900 truncate">{material}</span>
                  </div>
                ))}
                {allMaterials.length > 50 && (
                  <div className="p-4 text-center text-sm text-sky-500 border-t border-sky-200 mt-2">
                    +{allMaterials.length - 50} more...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialList;
