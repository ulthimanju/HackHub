import React, { memo, useState, useEffect } from 'react';
import { LogOut, User, Calendar, Compass, Search, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';
import Button from '../../common/Button/Button';
import { theme } from '../../../utils/theme';
import NotificationBell from '../NotificationBell/NotificationBell';
import { useNotifications } from '../../../hooks/useNotifications';

const MainLayout = memo(() => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications(user);
  
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (location.pathname === '/profile') {
      setCurrentPage('profile');
    } else if (location.pathname === '/my-events') {
      setCurrentPage('my-events');
    } else if (location.pathname === '/explore') {
      setCurrentPage('explore');
    } else if (location.pathname === '/') {
      setCurrentPage('dashboard');
    }
  }, [location.pathname]);

  const isOrganizer = user?.role === 'organizer';
  const isEventDetails = location.pathname.startsWith('/events/');
  const isExplorePage = currentPage === 'explore';
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const handleSearchChange = (val) => {
    if (val) setSearchParams({ q: val });
    else setSearchParams({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page === 'profile') navigate('/profile');
    else if (page === 'my-events') navigate('/my-events');
    else if (page === 'explore') navigate('/explore');
    else navigate('/');
  };

  return (
    <div className={`min-h-screen ${theme.surface.page} flex flex-col`}>
      <header className={theme.surface.header}>
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 
                className={`text-xl font-bold ${theme.primary.text} cursor-pointer`}
                onClick={() => handlePageChange('dashboard')}
              >
                EHub
              </h1>
            </div>
            {/* Search — only on Explore page */}
            {isExplorePage && (
              <div className="relative w-72 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events…"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-white"
                />
                {searchQuery && (
                  <button onClick={() => handleSearchChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            <div className="flex items-center gap-3">
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
                clearAll={clearAll}
              />
              <div className="h-6 w-px bg-gray-200 mx-1"></div>
              <div 
                className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors ${currentPage === 'profile' ? `${theme.primary.bgLight} ring-1 ${theme.primary.ring}` : 'hover:bg-gray-100'}`}
                onClick={() => handlePageChange('profile')}
              >
                <div className={`w-8 h-8 ${theme.primary.bg} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user?.username}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.role}</p>
                </div>
              </div>
              <Button 
                variant="ghost"
                size="sm"
                onClick={logout}
                className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full">
        {!isEventDetails && (
        <aside className={`hidden lg:block w-64 py-8 px-6 ${theme.surface.sidebar}`}>
          <nav className="space-y-1">
            <NavItem
              icon={LayoutDashboard}
              active={currentPage === 'dashboard'}
              onClick={() => handlePageChange('dashboard')}
            >
              Dashboard
            </NavItem>
            <NavItem 
              icon={Calendar}
              active={currentPage === 'my-events'}
              onClick={() => handlePageChange('my-events')}
            >
              My Events
            </NavItem>
            {!isOrganizer && (
              <NavItem
                icon={Compass}
                active={currentPage === 'explore'}
                onClick={() => handlePageChange('explore')}
              >
                Explore Events
              </NavItem>
            )}
            
            <div className={`pt-4 mt-4 border-t ${theme.surface.divider}`}>
            </div>
          </nav>
        </aside>
        )}

        <main className="flex-1 px-6 py-8 overflow-y-auto text-shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
});
MainLayout.displayName = 'MainLayout';
export default MainLayout;
