import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrganizerDashboard from '../components/features/dashboard/OrganizerDashboard/OrganizerDashboard';

const Home = () => {
  const { user } = useAuth();
  return user?.role === 'organizer'
    ? <OrganizerDashboard user={user} />
    : <Navigate to="/my-events" replace />;
};

export default Home;
