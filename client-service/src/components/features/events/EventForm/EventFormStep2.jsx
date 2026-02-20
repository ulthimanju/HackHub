import React from 'react';
import Input from '../../../common/Input/Input';
import Checkbox from '../../../common/Checkbox/Checkbox';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function EventFormStep2({ formData, errors, onChange }) {
  return (
    <>
      <Input
        label="Start Date*"
        name="startDate"
        type="datetime-local"
        icon={Calendar}
        value={formData.startDate}
        onChange={onChange}
        error={errors.startDate}
        required
      />
      <Input
        label="End Date*"
        name="endDate"
        type="datetime-local"
        icon={Calendar}
        value={formData.endDate}
        onChange={onChange}
        error={errors.endDate}
        required
      />
      <Input
        label="Registration Starts"
        name="registrationStartDate"
        type="datetime-local"
        icon={Calendar}
        value={formData.registrationStartDate}
        onChange={onChange}
      />
      <Input
        label="Registration Ends"
        name="registrationEndDate"
        type="datetime-local"
        icon={Calendar}
        value={formData.registrationEndDate}
        onChange={onChange}
        error={errors.registrationEndDate}
      />
      <div className="flex items-center pt-8">
        <Checkbox
          label="Virtual Event"
          name="isVirtual"
          checked={formData.isVirtual}
          onChange={onChange}
        />
      </div>
      <Input
        label={formData.isVirtual ? 'Virtual Platform' : 'Venue Location'}
        name="location"
        icon={MapPin}
        value={formData.location}
        onChange={onChange}
        placeholder={formData.isVirtual ? 'e.g. Discord' : 'e.g. Main Hall'}
      />
      <Input
        label="Max Participants"
        name="maxParticipants"
        type="number"
        icon={Users}
        value={formData.maxParticipants}
        onChange={onChange}
        placeholder="Unlimited"
      />
      <Input
        label="Team Size"
        name="teamSize"
        type="number"
        min="1"
        icon={Users}
        value={formData.teamSize}
        onChange={onChange}
      />
    </>
  );
}
