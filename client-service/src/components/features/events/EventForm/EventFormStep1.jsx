import React from 'react';
import Input from '../../../common/Input/Input';
import Textarea from '../../../common/Textarea/Textarea';
import TagAutocomplete from '../../../common/TagAutocomplete/TagAutocomplete';
import { Mail } from 'lucide-react';
import { ALL_THEMES } from '../../../../constants/themes';

export default function EventFormStep1({ formData, errors, onChange }) {
  const selectedThemes = formData.theme
    ? formData.theme.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const handleThemeChange = (newThemes) => {
    onChange({ target: { name: 'theme', value: newThemes.join(', ') } });
  };

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

      <div className="md:col-span-2">
        <TagAutocomplete
          label="Themes"
          items={ALL_THEMES}
          selected={selectedThemes}
          onChange={handleThemeChange}
          placeholder="Search themes to add..."
          emptyText="No themes selected"
        />
      </div>

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
