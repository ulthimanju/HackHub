import React, { memo, useState } from 'react';
import Button from '../../../common/Button/Button';
import Input from '../../../common/Input/Input';
import Textarea from '../../../common/Textarea/Textarea';
import Checkbox from '../../../common/Checkbox/Checkbox';
import TagAutocomplete from '../../../common/TagAutocomplete/TagAutocomplete';
import DateTimePicker from '../../../common/DateTimePicker/DateTimePicker';
import { Mail, MapPin, Users, BookOpen, Plus, X, Sparkles } from 'lucide-react';
import { ALL_THEMES } from '../../../../constants/themes';
import { validateEventStep } from './validateEventStep';

const INITIAL_FORM = {
  name: '', description: '', theme: '', contactEmail: '',
  startDate: '', endDate: '', registrationStartDate: '', registrationEndDate: '',
  resultsDate: '', venue: '', isVirtual: false, location: '',
  maxParticipants: '', teamSize: '1',
};

const toInputDate = (iso) => iso ? iso.slice(0, 16) : '';

const buildInitial = (data) => data ? {
  name:                  data.name                  ?? '',
  description:           data.description           ?? '',
  theme:                 data.theme                 ?? '',
  contactEmail:          data.contactEmail          ?? '',
  startDate:             toInputDate(data.startDate),
  endDate:               toInputDate(data.endDate),
  registrationStartDate: toInputDate(data.registrationStartDate),
  registrationEndDate:   toInputDate(data.registrationEndDate),
  resultsDate:           toInputDate(data.resultsDate),
  venue:                 data.venue                 ?? '',
  isVirtual:             data.isVirtual             ?? false,
  location:              data.location              ?? '',
  maxParticipants:       data.maxParticipants != null ? String(data.maxParticipants) : '',
  teamSize:              data.teamSize        != null ? String(data.teamSize)        : '1',
} : INITIAL_FORM;

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-0.5 h-5 bg-brand-500 rounded-full" />
      <h3 className="text-base font-semibold font-display text-ink-primary">{children}</h3>
    </div>
  );
}

const EventForm = memo(({ onSubmit, onCancel, loading, initialData }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState(() => buildInitial(initialData));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = { ...formData, [name]: type === 'checkbox' ? checked : value };
    if (name === 'startDate' && value) {
      const now = new Date().toISOString().slice(0, 16);
      const dayBefore = new Date(new Date(value).getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      if (!updated.registrationStartDate) updated.registrationStartDate = now;
      if (!updated.registrationEndDate)   updated.registrationEndDate   = dayBefore;
    }
    setFormData(updated);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleThemeChange = (newThemes) => {
    handleChange({ target: { name: 'theme', value: newThemes.join(', ') } });
  };

  const selectedThemes = formData.theme
    ? formData.theme.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const addListItem = (field, value, setValue) => {
    if (value.trim()) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setValue('');
    }
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSubmit = () => {
    const errs = {
      ...validateEventStep(1, formData),
      ...validateEventStep(2, formData),
      ...validateEventStep(3, formData),
    };
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit({
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : null,
        teamSize: formData.teamSize ? parseInt(formData.teamSize, 10) : null,
      });
    }
  };

  const regAutoFilled = formData.startDate && formData.registrationStartDate && formData.registrationEndDate;

  return (
    <div className="space-y-10">

      {/* Basics */}
      <section>
        <SectionTitle>Basics</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="md:col-span-2">
            <Input
              label="Event Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              onChange={handleChange}
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
          <div className="md:col-span-1">
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              icon={Mail}
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="organizer@example.com"
              error={errors.contactEmail}
              required
            />
          </div>
        </div>
      </section>

      <div className="border-t border-surface-border" />

      {/* Logistics */}
      <section>
        <SectionTitle>Logistics</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <DateTimePicker
              label="Start Date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
            />
          </div>
          <div>
            <DateTimePicker
              label="End Date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
            />
          </div>
          <div>
            <DateTimePicker
              label="Registration Starts"
              name="registrationStartDate"
              value={formData.registrationStartDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <DateTimePicker
              label="Registration Ends"
              name="registrationEndDate"
              value={formData.registrationEndDate}
              onChange={handleChange}
              error={errors.registrationEndDate}
            />
          </div>
          {regAutoFilled && (
            <div className="md:col-span-2 flex items-center gap-2 text-xs text-brand-600 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 -mt-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Registration dates auto-filled — opens now and closes 1 day before event starts. Adjust above if needed.
            </div>
          )}
          <div className="flex items-end pb-3">
            <Checkbox
              label="Virtual Event"
              name="isVirtual"
              checked={formData.isVirtual}
              onChange={handleChange}
            />
          </div>
          <Input
            label={formData.isVirtual ? 'Virtual Platform' : 'Venue Location'}
            name="location"
            icon={MapPin}
            value={formData.location}
            onChange={handleChange}
            placeholder={formData.isVirtual ? 'e.g. Discord' : 'e.g. Main Hall'}
          />

        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="button" variant="primary" onClick={handleSubmit} loading={loading} size="lg">
          {isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </div>
  );
});

EventForm.displayName = 'EventForm';
export default EventForm;
