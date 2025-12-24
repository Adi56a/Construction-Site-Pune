// src/pages/CreateSite.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateSite = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownerName: '',
    location: '',
    type: 'gov',
    contactNumber: '',
    dateOfCreation: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ownerName.trim() || formData.ownerName.trim().length < 3) {
      newErrors.ownerName = 'Owner name must be at least 3 characters long.';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required.';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required.';
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.dateOfCreation) {
      newErrors.dateOfCreation = 'Date of creation is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('http://localhost:3000/api/sites/create-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: data.message || 'Site created successfully.' });
        setFormData({
          ownerName: '',
          location: '',
          type: 'gov',
          contactNumber: '',
          dateOfCreation: new Date().toISOString().split('T')[0],
        });
      } else {
        setSubmitStatus({ type: 'error', message: data.message || 'Failed to create site.' });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Create New Site / Location
                </h1>
                <p className="text-sky-100 mt-2 max-w-lg leading-relaxed">
                  Register a new construction site with core contact and creation details.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                Construction Console
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {/* Status */}
            {submitStatus && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                  submitStatus.type === 'success'
                    ? 'bg-sky-50 border-sky-200 text-sky-800 border'
                    : 'bg-red-50 border-red-200 text-red-800 border'
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    submitStatus.type === 'success' ? 'bg-sky-500' : 'bg-red-500'
                  }`}
                />
                <span>{submitStatus.message}</span>
              </div>
            )}

            {/* Owner Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-sky-900">
                Owner / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-sky-900 placeholder-sky-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                  errors.ownerName
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-sky-200 bg-white hover:border-sky-300'
                }`}
                placeholder="e.g., Delta Constructions Pvt Ltd"
                maxLength={100}
              />
              {errors.ownerName && (
                <p className="text-xs text-red-600 mt-1">{errors.ownerName}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-sky-900">
                Location / Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-sky-900 placeholder-sky-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                  errors.location
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-sky-200 bg-white hover:border-sky-300'
                }`}
                placeholder="e.g., Hinjewadi Phase 2, Pune"
              />
              {errors.location && (
                <p className="text-xs text-red-600 mt-1">{errors.location}</p>
              )}
            </div>

            {/* Type + Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-sky-900">
                  Site Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-2 px-4 py-3 text-sm text-sky-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all border-sky-200 hover:border-sky-300"
                >
                  <option value="gov">Government Project</option>
                  <option value="solo">Individual / Contractor</option>
                  <option value="private">Private Company</option>
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-sky-900">
                  Date of Creation <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfCreation"
                  value={formData.dateOfCreation}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm text-sky-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                    errors.dateOfCreation
                      ? 'border-red-300 bg-red-50 focus:ring-red-500'
                      : 'border-sky-200 hover:border-sky-300'
                  }`}
                />
                {errors.dateOfCreation && (
                  <p className="text-xs text-red-600 mt-1">{errors.dateOfCreation}</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-sky-900">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sky-500 text-sm font-medium bg-white pr-2">
                  +91
                </span>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border-2 pl-16 pr-4 py-3 text-sm text-sky-900 placeholder-sky-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all ${
                    errors.contactNumber
                      ? 'border-red-300 bg-red-50 focus:ring-red-500'
                      : 'border-sky-200 bg-white hover:border-sky-300'
                  }`}
                  placeholder="10-digit mobile number"
                  maxLength={15}
                />
              </div>
              {errors.contactNumber && (
                <p className="text-xs text-red-600 mt-1">{errors.contactNumber}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-4 px-8 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-sky-300 text-sky-500 cursor-not-allowed'
                    : 'bg-sky-500 hover:bg-sky-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating site…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Create Site
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/site')}
                className="px-8 py-4 border-2 border-sky-200 bg-white hover:bg-sky-50 text-sky-700 font-semibold rounded-xl hover:shadow-sm transition-all hover:-translate-y-0.5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSite;
