import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageSpinner } from './components/common/Spinner/Spinner';
import { useAbility } from './hooks/useAbility';

// Layout
import MainLayout from './components/layout/MainLayout/MainLayout';

// Pages — lazy loaded for code splitting
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile      = lazy(() => import('./pages/Profile'));
const Home         = lazy(() => import('./pages/Home'));
const MyEvents     = lazy(() => import('./pages/MyEvents'));
const CreateEvent  = lazy(() => import('./pages/CreateEvent'));
const ExploreEvents = lazy(() => import('./pages/ExploreEvents'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const AddProblems  = lazy(() => import('./pages/AddProblems'));
const EditEvent    = lazy(() => import('./pages/EditEvent'));

/**
 * Protects a route: redirects unauthenticated users to /login.
 * If allowedRoles is provided, redirects users whose role is not in the list.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const { isRole } = useAbility();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !isRole(allowedRoles)) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;

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
      <Route 
        path="/reset-password" 
        element={user ? <Navigate to="/profile" replace /> : <ResetPassword />} 
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
        <Route path="/my-events/create" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <CreateEvent />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={<ExploreEvents />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events/:id/problems/add" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <AddProblems />
          </ProtectedRoute>
        } />
        <Route path="/events/:id/edit" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <EditEvent />
          </ProtectedRoute>
        } />
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
