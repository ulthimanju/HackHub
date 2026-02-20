import React from 'react';
import { useAuth } from '../context/AuthContext';
import OrganizerDashboard from '../components/features/dashboard/OrganizerDashboard/OrganizerDashboard';
import ParticipantDashboard from '../components/features/dashboard/ParticipantDashboard/ParticipantDashboard';

const Home = () => {
  const { user } = useAuth();
  return user?.role === 'organizer'
    ? <OrganizerDashboard user={user} />
    : <ParticipantDashboard user={user} />;
};

export default Home;
