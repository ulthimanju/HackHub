import React, { memo } from 'react';
import Button from '../../../common/Button/Button';
import { PlusCircle } from 'lucide-react';

const EventsHeader = memo(({ title, description, showCreateButton, onCreateClick }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="font-display font-semibold text-2xl text-ink-primary tracking-tight">{title}</h2>
        {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
      </div>
      {showCreateButton && (
        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={onCreateClick}
        >
          Create Event
        </Button>
      )}
    </div>
  );
});
EventsHeader.displayName = 'EventsHeader';
export default EventsHeader;
