import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Section from '../components/common/Section/Section';
import EventCard from '../components/features/dashboard/EventCard/EventCard';
import UserProfileCard from '../components/features/profile/UserProfileCard/UserProfileCard';
import Tab from '../components/common/Tab/Tab';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Textarea from '../components/common/Textarea/Textarea';
import Checkbox from '../components/common/Checkbox/Checkbox';
import { Check, Settings, Calendar, Search } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 text-shadow-sm">Welcome back, {user?.username}!</h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
          Manage your hackathons, track evaluations, and connect with other developers.
        </p>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-6">
          {['overview', 'components'].map((tab) => (
            <Tab
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Tab>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <Section title="Active Events">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EventCard
                status="Ongoing"
                title="Spring Innovation Hack"
                description="Build the next generation of cloud-native applications using modern Java frameworks."
                date="Feb 15 - 17, 2026"
                onEnter={() => console.log('Enter event')}
              />
              <EventCard
                status="Upcoming"
                title="AI Challenge 2026"
                description="Harness the power of LLMs to solve real-world problems in productivity and creativity."
                date="Mar 10, 2026"
                onEnter={() => console.log('Enter event')}
              />
            </div>
          </Section>

          <Section title="Profile Overview">
            <UserProfileCard
              username={user?.username}
              role={user?.role}
              email={user?.email || 'N/A'}
              accountId={user?.id?.substring(0, 8) + "..."}
            />
          </Section>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="Buttons">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={Check}>Primary Action</Button>
              <Button variant="secondary" icon={Settings}>Settings</Button>
              <Button variant="outline" icon={Calendar}>View Date</Button>
            </div>
          </Section>

          <Section title="Form Elements">
            <div className="space-y-4">
              <Input label="Search" icon={Search} placeholder="Search anything..." />
              <Textarea label="Bio" placeholder="Tell us about yourself..." />
              <Checkbox 
                id="comp-check"
                label="Enable notifications"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
            </div>
          </Section>
        </div>
      )}
    </div>
  );
};

export default Home;
