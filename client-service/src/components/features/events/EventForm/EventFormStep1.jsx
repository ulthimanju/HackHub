import React from 'react';
import Input from '../../../common/Input/Input';
import Textarea from '../../../common/Textarea/Textarea';
import { Mail } from 'lucide-react';

export default function EventFormStep1({ formData, errors, onChange }) {
  return (
    <>
      <div className="md:col-span-2">
        <Input
          label="Event Name*"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="e.g. Global Hack 2026"
          error={errors.name}
          required
        />
      </div>
      <div className="md:col-span-2">
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="What is this hackathon about?"
          rows={4}
        />
      </div>
      <Input
        label="Theme"
        name="theme"
        value={formData.theme}
        onChange={onChange}
        placeholder="e.g. Sustainability, AI"
      />
      <Input
        label="Contact Email*"
        name="contactEmail"
        type="email"
        icon={Mail}
        value={formData.contactEmail}
        onChange={onChange}
        placeholder="organizer@example.com"
        error={errors.contactEmail}
        required
      />
    </>
  );
}
