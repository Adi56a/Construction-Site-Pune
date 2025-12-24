// src/pages/Site.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { key: 'solo', label: 'Solo' },
  { key: 'gov', label: 'Government' },
  { key: 'private', label: 'Private' },
];

const Site = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('solo');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('http://localhost:3000/api/sites/get-sites');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch sites');
      }

      setSites(data.sites || []);
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching sites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const filteredSites = sites.filter((site) => site.type === activeTab);

  const handleViewSite = (site) => {
    if (!site.id) {
      console.warn('No site.id found in site object:', site);
      return;
    }

    localStorage.setItem('selectedSite', JSON.stringify(site));
    navigate('/site-details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-sky-900 tracking-tight">
              Sites Overview
            </h1>
            <p className="text-sm sm:text-base text-sky-600 mt-1">
              Manage all your Solo, Government, and Private sites in one place.
            </p>
          </div>
          <button
            onClick={() => navigate('/create-site')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-sky-50 transition"
          >
            <span className="text-base leading-none">＋</span>
            <span>Add Site</span>
          </button>
        </div>

        {/* Tabs with sliding indicator */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 px-3 py-2 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="grid grid-cols-3 rounded-xl bg-sky-50 p-1">
              {/* Sliding indicator */}
              <div
                className="absolute top-1 bottom-1 w-1/3 rounded-xl bg-white/90 shadow-sm border border-sky-200 transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(${
                    activeTab === 'solo' ? '0%' : activeTab === 'gov' ? '100%' : '200%'
                  })`,
                }}
              />
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative z-10 flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-sky-900'
                      : 'text-sky-500 hover:text-sky-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-sky-500 pr-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span>
              Total:{' '}
              <span className="font-semibold text-sky-700">
                {filteredSites.length}
              </span>{' '}
              {activeTab} site(s)
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 p-5 min-h-[320px]">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-sky-500 text-sm">
              <svg
                className="h-5 w-5 animate-spin mr-2 text-sky-500"
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
              Loading sites…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <p className="text-sm text-red-500 font-medium">{error}</p>
              <button
                onClick={fetchSites}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
              <p className="text-sm text-sky-500">
                No {activeTab} sites found yet.
              </p>
              <button
                onClick={() => navigate('/create-site')}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
              >
                Add your first site
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSites.map((site, idx) => (
                <div
                  key={site.id || `${site.ownerName}-${site.location}-${idx}`}
                  className="rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-white hover:shadow-md transition p-4 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-sky-900 line-clamp-2">
                        {site.ownerName || 'Unnamed Site'}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-600">
                        {site.type}
                      </span>
                    </div>
                    <p className="text-xs text-sky-600 line-clamp-2">
                      {site.location}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-sky-500 mt-1">
                      <span>
                        Created:{' '}
                        <span className="font-medium text-sky-700">
                          {site.dateOfCreation
                            ? new Date(site.dateOfCreation).toLocaleDateString()
                            : '—'}
                        </span>
                      </span>
                      <span>
                        Contact:{' '}
                        <span className="font-medium text-sky-700">
                          {site.contactNumber || '—'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleViewSite(site)}
                      className="inline-flex items-center rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition"
                    >
                      View Site
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Site;
