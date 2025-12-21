// src/pages/Home.jsx
import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiSun, FiMoon, FiActivity, FiTruck, FiCreditCard } from 'react-icons/fi';

function Home() {
  const [theme, setTheme] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const sections = [
    {
      label: 'Site',
      path: 'site',
      description: 'Track sites, materials, labor, and daily progress in real time.',
      icon: FiActivity,
      accentDark: 'from-sky-500/15 to-sky-500/5',
      accentLight: 'from-sky-100 to-white',
      iconBgDark: 'bg-sky-500/10 text-sky-300 ring-sky-500/40',
      iconBgLight: 'bg-sky-100 text-sky-600 ring-sky-200',
    },
    {
      label: 'Rent',
      path: 'rent',
      description: 'Manage equipment rentals, availability, and utilization costs.',
      icon: FiTruck,
      accentDark: 'from-emerald-500/15 to-emerald-500/5',
      accentLight: 'from-emerald-100 to-white',
      iconBgDark: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/40',
      iconBgLight: 'bg-emerald-100 text-emerald-600 ring-emerald-200',
    },
    {
      label: 'Account',
      path: 'account',
      description: 'Handle invoices, payments, and vendor accounts in one place.',
      icon: FiCreditCard,
      accentDark: 'from-amber-500/15 to-amber-500/5',
      accentLight: 'from-amber-100 to-white',
      iconBgDark: 'bg-amber-500/10 text-amber-300 ring-amber-500/40',
      iconBgLight: 'bg-amber-100 text-amber-600 ring-amber-200',
    },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* App shell */}
      <div className="flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Construction Console
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Site Management Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose a workspace to manage operations, rentals, and accounts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 md:inline-flex">
                Live environment
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 p-2 text-slate-700 shadow-sm transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                aria-label="Toggle theme"
              >
                {isDark ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex flex-1 items-stretch justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Left: Big cards grid */}
            <section className="grid content-center gap-6 sm:grid-cols-3">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <NavLink
                    key={section.path}
                    to={section.path}
                    end
                    className={({ isActive }) =>
                      [
                        'group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-sm transition-all',
                        'border-slate-200/80 bg-white shadow-slate-900/5 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg',
                        'dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-black/30 dark:hover:border-slate-700 dark:hover:shadow-black/50',
                        isDark ? section.accentDark : section.accentLight,
                        isActive
                          ? 'ring-2 ring-offset-2 ring-offset-slate-50 ring-sky-500 dark:ring-offset-slate-950'
                          : 'ring-0',
                      ].join(' ')
                    }
                  >
                    <div>
                      <div
                        className={[
                          'mb-4 inline-flex size-11 items-center justify-center rounded-xl ring-1',
                          isDark ? section.iconBgDark : section.iconBgLight,
                        ].join(' ')}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {section.label}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {section.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Workspace
                      </span>
                      <span className="inline-flex items-center gap-1 text-sky-600 group-hover:text-sky-500 dark:text-sky-300 dark:group-hover:text-sky-200">
                        Open
                        <svg
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M6 14L14 6M10 6H14V10"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>

                    <div className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen blur-3xl transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-500/20" />
                      <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-emerald-500/15" />
                    </div>
                  </NavLink>
                );
              })}
            </section>

            {/* Right: Workspace details panel */}
            <section className="flex flex-col">
              <div className="flex-1 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/40">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Workspace details
                  </h3>
                </div>
                <div className="h-full min-h-[260px]">
                  <Outlet />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;



