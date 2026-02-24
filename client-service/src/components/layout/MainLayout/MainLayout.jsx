import React, { memo, useState, useEffect } from 'react';
import { LogOut, Calendar, Compass, Search, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAbility } from '../../../hooks/useAbility';
import { useNavigate, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';
import Button from '../../common/Button/Button';
import { theme } from '../../../utils/theme';
import NotificationBell from '../NotificationBell/NotificationBell';
import { useNotifications } from '../../../hooks/useNotifications';

const MainLayout = memo(() => {
  const { user, logout } = useAuth();
  const { isOrganizer } = useAbility();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications(user);

  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const p = location.pathname;
    if (p === '/profile')    setCurrentPage('profile');
    else if (p === '/my-events') setCurrentPage('my-events');
    else if (p === '/explore')   setCurrentPage('explore');
    else if (p === '/')          setCurrentPage('dashboard');
  }, [location.pathname]);

  const isEventDetails = location.pathname.startsWith('/events/');
  const isExplorePage   = currentPage === 'explore';
  const isDashboard     = currentPage === 'dashboard';
  const showSearch      = isExplorePage || isDashboard;
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const handleSearchChange = (val) => {
    if (val) setSearchParams({ q: val });
    else setSearchParams({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page === 'profile')    navigate('/profile');
    else if (page === 'my-events') navigate('/my-events');
    else if (page === 'explore')   navigate('/explore');
    else navigate('/');
  };

  return (
    <div className={`min-h-screen ${theme.surface.page} flex flex-col`}>
      {/* ── Header (fixed) ── */}
      <header className={`fixed top-0 left-0 right-0 z-30 ${theme.surface.header}`}>
        <div className="relative w-full px-5 h-14 flex items-center">
          {/* Logo — left */}
          <button
            onClick={() => handlePageChange('dashboard')}
            className="font-display font-bold text-base text-ink-primary hover:text-brand-600 transition-colors shrink-0"
          >
            EHub
          </button>

          {/* Search — absolutely centered */}
          {showSearch && (
            <div className="absolute left-1/2 -translate-x-1/2 w-72 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
              <input
                type="text"
                placeholder="Search events…"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-surface-border text-sm text-ink-secondary placeholder-ink-muted/60 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Right controls — pushed to edge */}
          <div className="flex items-center gap-1.5 ml-auto">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              clearAll={clearAll}
            />
          </div>
        </div>
      </header>

      {/* ── Body (offset below fixed header) ── */}
      <div className="flex flex-1 pt-14" style={{ height: '100vh' }}>
        {/* Sidebar (fixed, full height below header) */}
        {!isEventDetails && (
          <aside className={`hidden lg:flex flex-col w-56 fixed top-14 bottom-0 left-0 z-20 ${theme.surface.sidebar} shrink-0`}>
            <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
              {isOrganizer && (
                <NavItem
                  icon={LayoutDashboard}
                  active={currentPage === 'dashboard'}
                  onClick={() => handlePageChange('dashboard')}
                >
                  Dashboard
                </NavItem>
              )}
              {!isOrganizer && (
                <NavItem
                  icon={Calendar}
                  active={currentPage === 'my-events'}
                  onClick={() => handlePageChange('my-events')}
                >
                  My Events
                </NavItem>
              )}
              {!isOrganizer && (
                <NavItem
                  icon={Compass}
                  active={currentPage === 'explore'}
                  onClick={() => handlePageChange('explore')}
                >
                  Explore Events
                </NavItem>
              )}
            </nav>

            {/* Profile section at bottom of sidebar */}
            <div className="shrink-0 border-t border-surface-border p-3">
              <button
                onClick={() => handlePageChange('profile')}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-150 ${
                  currentPage === 'profile'
                    ? 'bg-brand-50 ring-1 ring-brand-200'
                    : 'hover:bg-surface-hover'
                }`}
              >
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {user?.username?.substring(0, 2).toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-ink-primary leading-none truncate">{user?.username}</p>
                  <p className="text-xs text-ink-muted mt-0.5 capitalize">{user?.role}</p>
                </div>
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="mt-1 w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600 transition-all duration-150"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className={`flex-1 min-w-0 px-6 pt-4 pb-6 overflow-y-auto ${!isEventDetails ? 'lg:ml-56' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
});

MainLayout.displayName = 'MainLayout';
export default MainLayout;
