import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import Badge from './Badge';

const EventCard = ({ status, title, description, date, onEnter }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow max-w-md">
      <div className="flex items-start justify-between mb-4">
        <Badge>{status}</Badge>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>
      
      <h4 className="text-2xl font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-base text-gray-600 mb-6 leading-relaxed">{description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span>{date}</span>
        </div>
        <button 
          onClick={onEnter}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors group"
        >
          Enter Event
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
