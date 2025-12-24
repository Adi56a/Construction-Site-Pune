// src/pages/SiteDetails.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SiteDetails = () => {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedSite = JSON.parse(localStorage.getItem('selectedSite') || '{}');
    
    if (!selectedSite.id) {
      navigate('/'); // redirect to sites list if no site selected
      return;
    }

    setSite(selectedSite);
    setLoading(false);
  }, [navigate]);

  const handleNavigate = (route) => {
    navigate(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="h-8 w-8 animate-spin text-sky-600 mx-auto mb-3"
            xmlns="http://www.w3.org/2000/svg"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sky-500 text-sm">Loading site details...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-sky-900 mb-2">No Site Selected</h2>
          <p className="text-sky-500 mb-6">Please select a site from the overview page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition"
          >
            Go to Sites
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Site Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-sky-100 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
              <div className="flex-shrink-0 mb-4 lg:mb-0">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                  {site.ownerName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sky-100 mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {site.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-xl text-sm font-medium">
                    <span className="w-2 h-2 bg-sky-300 rounded-full" />
                    {site.type === 'gov' ? 'Government Project' : site.type === 'solo' ? 'Solo Contractor' : 'Private Company'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Created: {new Date(site.dateOfCreation).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.27 7.27c.883.883 2.317.883 3.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>+91 {site.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>ID: {site.id.slice(-8)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Material Block */}
          <div
            className="group cursor-pointer bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            onClick={() => handleNavigate('/site-material')}
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-sky-400 to-sky-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-4V7m8 4h-4m0 0l-4-4m4 4l-4 4M8 21l4-4 4 4M3 4h4m0 0l-4 4m4-4v10l-4 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sky-900 mb-2 group-hover:text-sky-600 transition-colors">
                Materials
              </h3>
              <p className="text-sm text-sky-600 mb-6 leading-relaxed">
                Track material inventory, usage, procurement, and supplier management for this site.
              </p>
              <div className="flex items-center justify-center gap-2 text-sky-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                <span>Manage Materials</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Labour Block */}
          <div
            className="group cursor-pointer bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            onClick={() => handleNavigate('/labour')}
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-sky-400 to-sky-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sky-900 mb-2 group-hover:text-sky-600 transition-colors">
                Labour
              </h3>
              <p className="text-sm text-sky-600 mb-6 leading-relaxed">
                Manage worker attendance, payments, advances, and transfers for site personnel.
              </p>
              <div className="flex items-center justify-center gap-2 text-sky-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                <span>Manage Labour</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Account Block */}
          <div
            className="group cursor-pointer bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            onClick={() => handleNavigate('/account')}
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-sky-400 to-sky-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sky-900 mb-2 group-hover:text-sky-600 transition-colors">
                Accounts
              </h3>
              <p className="text-sm text-sky-600 mb-6 leading-relaxed">
                Track expenses, payments, budgets, and financial reporting for this construction site.
              </p>
              <div className="flex items-center justify-center gap-2 text-sky-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                <span>Manage Accounts</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* New AddMaterialList Block */}
          <div
            className="group cursor-pointer bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            onClick={() => handleNavigate('/add-material-list')}
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-sky-400 to-sky-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-sky-900 mb-2 group-hover:text-sky-600 transition-colors">
                Add Material List
              </h3>
              <p className="text-sm text-sky-600 mb-6 leading-relaxed">
                Create and manage master material list with standard units for consistent tracking.
              </p>
              <div className="flex items-center justify-center gap-2 text-sky-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                <span>Add Materials</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetails;
