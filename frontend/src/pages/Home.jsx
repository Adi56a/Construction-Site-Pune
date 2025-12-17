// src/pages/Home.jsx
import { NavLink, Outlet } from 'react-router-dom'

function Home() {
  const tabs = [
    { label: 'Site', path: 'site' },
    { label: 'Account', path: 'account' },
    { label: 'Rent', path: 'rent' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Construction Site Management
            </h1>
            <p className="text-sm text-slate-500">
              Centralize site operations, accounts, and equipment rentals.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl px-4">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end
              className={({ isActive }) =>
                [
                  'inline-flex items-center border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                ].join(' ')
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Home
