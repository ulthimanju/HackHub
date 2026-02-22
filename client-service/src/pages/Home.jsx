import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAbility } from '../hooks/useAbility';
import OrganizerDashboard from '../components/features/dashboard/OrganizerDashboard/OrganizerDashboard';

const Home = () => {
  const { user } = useAuth();
  const { isOrganizer } = useAbility();
  return isOrganizer
    ? <OrganizerDashboard user={user} />
    : <Navigate to="/my-events" replace />;
};

export default Home;
