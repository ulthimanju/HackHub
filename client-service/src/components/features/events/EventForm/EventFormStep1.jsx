import React, { useState } from 'react';
import Input from '../../../common/Input/Input';
import Textarea from '../../../common/Textarea/Textarea';
import { Mail, Search, X } from 'lucide-react';
import { ALL_THEMES } from '../../../../constants/themes';

export default function EventFormStep1({ formData, errors, onChange }) {
  const [themeInput, setThemeInput] = useState('');

  const selected = formData.theme
    ? formData.theme.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const filteredOptions = themeInput.trim()
    ? ALL_THEMES.filter(
        t => t.toLowerCase().includes(themeInput.toLowerCase()) && !selected.includes(t)
      ).slice(0, 8)
    : [];

  const addTheme = (t) => {
    if (!selected.includes(t))
      onChange({ target: { name: 'theme', value: [...selected, t].join(', ') } });
    setThemeInput('');
  };

  const removeTheme = (t) => {
    onChange({ target: { name: 'theme', value: selected.filter(x => x !== t).join(', ') } });
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

      {/* Theme autocomplete */}
      <div className="md:col-span-2 space-y-2">
        <label className="block text-sm font-medium text-gray-700">Themes</label>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {selected.map(t => (
            <span key={t} className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-xs font-semibold">
              {t}
              <button type="button" onClick={() => removeTheme(t)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selected.length === 0 && <span className="text-xs text-gray-400 italic">No themes selected</span>}
        </div>

        {/* Search input + dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-orange-300 focus-within:border-orange-400">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 text-sm outline-none placeholder-gray-400"
              placeholder="Search themes to add…"
              value={themeInput}
              onChange={e => setThemeInput(e.target.value)}
            />
          </div>
          {filteredOptions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {filteredOptions.map(t => (
                <button key={t} type="button" onClick={() => addTheme(t)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          )}
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
