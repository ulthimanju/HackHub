import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout/MainLayout';

// Pages — lazy loaded for code splitting
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const Profile      = lazy(() => import('./pages/Profile'));
const Home         = lazy(() => import('./pages/Home'));
const MyEvents     = lazy(() => import('./pages/MyEvents'));
const CreateEvent  = lazy(() => import('./pages/CreateEvent'));
const ExploreEvents = lazy(() => import('./pages/ExploreEvents'));
const EventDetails = lazy(() => import('./pages/EventDetails'));

const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-page">
    <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/profile" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/profile" replace /> : <Register />} 
      />
      
      {/* Protected Routes with Common Layout */}
      <Route 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/my-events/create" element={<CreateEvent />} />
        <Route path="/explore" element={<ExploreEvents />} />
        <Route path="/events/:id" element={<EventDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
