import React from 'react';
import Input from '../../../common/Input/Input';
import Textarea from '../../../common/Textarea/Textarea';
import { Mail, X } from 'lucide-react';
import { THEME_CATEGORIES } from '../../../../constants/themes';

export default function EventFormStep1({ formData, errors, onChange }) {
  const selected = formData.theme
    ? formData.theme.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const toggle = (theme) => {
    const next = selected.includes(theme)
      ? selected.filter(t => t !== theme)
      : [...selected, theme];
    onChange({ target: { name: 'theme', value: next.join(', ') } });
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

      {/* Theme multi-select */}
      <div className="md:col-span-2 space-y-3">
        <label className="block text-sm font-medium text-gray-700">Themes</label>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {selected.map(t => (
              <span key={t} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold px-3 py-1 rounded-full">
                {t}
                <button type="button" onClick={() => toggle(t)} className="hover:text-orange-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Grouped options */}
        <div className="border border-gray-200 rounded-2xl p-4 space-y-3 max-h-56 overflow-y-auto bg-gray-50">
          {Object.entries(THEME_CATEGORIES).map(([cat, themes]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {themes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggle(t)}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                      selected.includes(t)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
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
