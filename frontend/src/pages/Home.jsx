// src/pages/Home.jsx
import { NavLink } from 'react-router-dom';
import { FiHome, FiDollarSign, FiCreditCard } from 'react-icons/fi';

function Home() {
  const sections = [
    {
      label: 'Site',
      path: 'site',
      description: 'Track sites, materials, labor, and daily progress in real time.',
      icon: FiHome,
    },
    {
      label: 'Rent',
      path: 'rent',
      description: 'Manage equipment rentals, availability, and utilization costs.',
      icon: FiDollarSign,
    },
    {
      label: 'Account',
      path: 'account',
      description: 'Handle invoices, payments, and vendor accounts in one place.',
      icon: FiCreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50">
      <div className="flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="border-b border-sky-100 bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 shadow-lg">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/20">
                  <span className="font-bold text-white text-lg tracking-tight">CC</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
                  Construction Console
                </p>
                <h1 className="text-2xl font-bold text-sky-900 tracking-tight">
                  Site Management Dashboard
                </h1>
                <p className="mt-1 text-sm text-sky-600">
                  Choose a workspace to manage operations, rentals, and accounts.
                </p>
              </div>
            </div>

            <div className="hidden items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 md:inline-flex">
              Live environment
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </div>
          </div>
        </header>

        {/* Body - Three cards only */}
        <main className="flex flex-1 items-center justify-center p-8 lg:p-12">
          <div className="grid w-full max-w-6xl gap-8 sm:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <NavLink
                  key={section.path}
                  to={section.path}
                  end
                  className={({ isActive }) =>
                    [
                      'group relative flex h-72 flex-col justify-between rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition-all duration-200',
                      'border-sky-100 hover:border-sky-200',
                      isActive
                        ? 'border-sky-500 bg-sky-50 shadow-sky-200 ring-2 ring-sky-500/30 ring-offset-2 ring-offset-sky-50'
                        : '',
                    ].join(' ')
                  }
                >
                  <div>
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-sky-100 text-sky-600 shadow-sm">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h2 className="mb-4 text-xl font-semibold text-sky-900 group-hover:text-sky-800">
                      {section.label}
                    </h2>
                    <p className="text-sm text-sky-700 leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 border border-sky-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      Active
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 group-hover:text-sky-700">
                      Enter →
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
