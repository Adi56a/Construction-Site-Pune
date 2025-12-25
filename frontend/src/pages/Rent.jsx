// src/pages/Rent.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiPieChart } from 'react-icons/fi';

const Rent = () => {
  const sections = [
    {
      label: 'List of Building',
      path: '/add-rent-building',
      description: 'View and manage all rented or rentable buildings in one place.',
      icon: FiHome, // building / property
    },
    {
      label: 'Expenses',
      path: '/expenses',
      description: 'Track rent-related expenses, utilities, and other recurring costs.',
      icon: FiPieChart, // expense / analytics
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm px-6 py-5">
          <h1 className="text-2xl font-bold text-sky-900 tracking-tight">
            Rent Management
          </h1>
          <p className="mt-1 text-sm text-sky-600">
            Access building lists and expenses related to rentals.
          </p>
        </header>

        {/* Two main blocks */}
        <main className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.path}
                to={section.path}
                end
                className={({ isActive }) =>
                  [
                    'group flex h-52 flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-colors',
                    'border-sky-100 hover:border-sky-200',
                    isActive
                      ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-500/30 ring-offset-2 ring-offset-sky-50'
                      : '',
                  ].join(' ')
                }
              >
                <div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-sky-900 group-hover:text-sky-800">
                    {section.label}
                  </h2>
                  <p className="text-sm text-sky-700 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    Module
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 group-hover:text-sky-700">
                    Open →
                  </span>
                </div>
              </NavLink>
            );
          })}
        </main>
      </div>
    </div>
  );
};

export default Rent;
