import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, Home, Folder, Users, Calendar, Check, LogOut, LayoutDashboard, User, PlusCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';
import Button from '../../common/Button/Button';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (location.pathname === '/profile') {
      setCurrentPage('profile');
    } else if (location.pathname === '/my-events') {
      setCurrentPage('my-events');
    } else if (location.pathname === '/') {
      setCurrentPage('dashboard');
    }
  }, [location.pathname]);

  const isOrganizer = user?.role === 'organizer';

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page === 'profile') navigate('/profile');
    else if (page === 'my-events') navigate('/my-events');
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 
                className="text-xl font-bold text-orange-600 cursor-pointer"
                onClick={() => handlePageChange('dashboard')}
              >
                EHub
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="p-2 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </Button>
              <div className="h-6 w-px bg-gray-200 mx-1"></div>
              <div 
                className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors ${currentPage === 'profile' ? 'bg-orange-50 ring-1 ring-orange-200' : 'hover:bg-gray-100'}`}
                onClick={() => handlePageChange('profile')}
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 py-8 px-6 border-r border-gray-200">
          <nav className="space-y-1">
            <NavItem 
              icon={LayoutDashboard} 
              active={currentPage === 'dashboard'}
              onClick={() => handlePageChange('dashboard')}
            >
              Overview
            </NavItem>
            <Button 
              variant="secondary" 
              fullWidth
              className="bg-white/10 border-white/10 text-white hover:bg-white hover:text-gray-900 relative z-10"
            >
              Explore Documentation
            </Button>
            <NavItem 
              icon={Calendar}
              active={currentPage === 'my-events'}
              onClick={() => handlePageChange('my-events')}
            >
              My Events
            </NavItem>
            <NavItem icon={Users}>My Teams</NavItem>
            
            <div className="pt-4 mt-4 border-t border-gray-100">
              <NavItem 
                icon={User} 
                active={currentPage === 'profile'}
                onClick={() => handlePageChange('profile')}
              >
                Profile Settings
              </NavItem>
              <NavItem icon={Settings}>General</NavItem>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto text-shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
