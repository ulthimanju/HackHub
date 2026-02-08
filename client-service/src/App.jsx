import React, { useState } from 'react';
import { Search, Bell, Settings, Home, Folder, Users, Calendar, Check } from 'lucide-react';

// Import UI components
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import Textarea from './components/ui/Textarea';
import Checkbox from './components/ui/Checkbox';
import Badge from './components/ui/Badge';
import Alert from './components/ui/Alert';
import NavItem from './components/ui/NavItem';
import UserProfileCard from './components/ui/UserProfileCard';
import EventCard from './components/ui/EventCard';
import Tab from './components/ui/Tab';
import Section from './components/ui/Section';

export default function GitHubNotionDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        input[type="checkbox"]:checked {
          background-color: #ea580c;
          border-color: #ea580c;
        }
        input[type="checkbox"]:focus {
          --tw-ring-color: rgb(249 115 22 / 0.5);
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">Design System</h1>
              <nav className="flex gap-6">
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Overview</a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Components</a>
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Patterns</a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Component Library</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
            A collection of beautifully designed components inspired by GitHub's clean aesthetics 
            and Notion's thoughtful typography. Built with React and Tailwind CSS.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-6">
            {['overview', 'buttons', 'forms', 'cards'].map((tab) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buttons Section */}
          <Section title="Buttons">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={Check}>Primary Button</Button>
              <Button variant="secondary" icon={Settings}>Secondary Button</Button>
              <Button variant="outline" icon={Calendar}>Outline Button</Button>
            </div>
          </Section>

          {/* Form Elements */}
          <Section title="Form Elements">
            <div className="space-y-4">
              <Input label="Input Field" icon={Search} placeholder="Enter text..." />
              <Input 
                label="Email Input" 
                type="email"
                icon={(props) => (
                  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                placeholder="Enter email..." 
              />
              <Textarea label="Textarea" placeholder="Enter description..." />
              <Checkbox 
                id="checkbox"
                label="I agree to the terms and conditions"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
            </div>
          </Section>

          {/* Badges and Tags */}
          <Section title="Badges & Tags">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Status Badges</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Active</Badge>
                  <Badge>Pending</Badge>
                  <Badge>Closed</Badge>
                  <Badge>In Progress</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  <Badge removable>Design</Badge>
                  <Badge removable>Development</Badge>
                  <Badge removable>Marketing</Badge>
                </div>
              </div>
            </div>
          </Section>

          {/* Navigation List */}
          <Section title="Navigation">
            <nav className="space-y-1">
              <NavItem icon={Home} active>Dashboard</NavItem>
              <NavItem icon={Folder}>Projects</NavItem>
              <NavItem icon={Users}>Team</NavItem>
              <NavItem icon={Calendar}>Calendar</NavItem>
            </nav>
          </Section>

          {/* Alert Messages */}
          <Section title="Alerts">
            <div className="space-y-3">
              <Alert type="warning" title="Action Required">
                Please review and approve the pending changes.
              </Alert>
              <Alert type="success" title="Success">
                Your changes have been saved successfully.
              </Alert>
              <Alert type="info" title="Information">
                New features are now available in your account.
              </Alert>
            </div>
          </Section>

          {/* User Profile Card */}
          <Section title="User Profile Card">
            <UserProfileCard
              username="manju1545"
              role="Participant"
              email="manju.ulthi@gmail.com"
              accountId="55b4e82b..."
            />
          </Section>

          {/* Event Card */}
          <Section title="Event Card">
            <EventCard
              status="Ongoing"
              title="Test"
              description="testing phase"
              date="Feb 7, 2026"
              onEnter={() => console.log('Enter event clicked')}
            />
          </Section>
        </div>

        {/* Typography Showcase */}
        <Section title="Typography">
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Heading 1</h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Heading 2</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Heading 3</h3>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Heading 4</h4>
            </div>
            <div className="space-y-2">
              <p className="text-base text-gray-700 leading-relaxed">
                This is a paragraph of body text. Notion-inspired typography focuses on readability 
                and comfortable line heights for extended reading. The text should feel natural and easy on the eyes.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                This is smaller text, often used for secondary information or captions. 
                It maintains the same attention to spacing and readability.
              </p>
              <p className="text-xs text-gray-500">
                This is extra small text, typically used for metadata or fine print.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 items-baseline">
              <span className="text-base font-normal text-gray-900">Regular</span>
              <span className="text-base font-medium text-gray-900">Medium</span>
              <span className="text-base font-semibold text-gray-900">Semibold</span>
              <span className="text-base font-bold text-gray-900">Bold</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
