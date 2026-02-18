import React, { memo } from 'react';
import Button from '../../../common/Button/Button';
import { PlusCircle } from 'lucide-react';

const EventsHeader = memo(({ title, description, showCreateButton, onCreateClick }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-gray-500 mt-1 font-medium">{description}</p>
      </div>
      
      {showCreateButton && (
        <Button 
          variant="primary" 
          icon={PlusCircle} 
          onClick={onCreateClick}
          size="lg"
        >
          Create New Event
        </Button>
      )}
    </div>
  );
});
EventsHeader.displayName = 'EventsHeader';
export default EventsHeader;
