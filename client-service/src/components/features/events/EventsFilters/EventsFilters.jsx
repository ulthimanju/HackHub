import React from 'react';
import Section from '../../../common/Section/Section';
import Input from '../../../common/Input/Input';
import { Search as SearchIcon } from 'lucide-react';

const EventsFilters = ({ onSearchChange, onStatusChange }) => {
  return (
    <Section title="Filters">
      <div className="space-y-4">
        <Input 
          icon={SearchIcon} 
          placeholder="Search events..." 
          className="rounded-xl text-xs"
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
          <div className="space-y-1">
            {['Upcoming', 'Ongoing', 'Completed'].map(status => (
              <label key={status} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" 
                  onChange={(e) => onStatusChange(status, e.target.checked)}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{status}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default EventsFilters;
