import React, { useState, useRef, useEffect, memo } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable autocomplete tag picker.
 *
 * Props:
 *   items        – string[] — full list of available options
 *   selected     – string[] — currently selected tags
 *   onChange     – fn(string[]) — called with updated selection
 *   label        – string (optional) — label above the chips
 *   placeholder  – string (optional) — input placeholder text
 *   emptyText    – string (optional) — shown when nothing selected
 *   maxDropdown  – number (default 8) — max dropdown items shown
 */
const TagAutocomplete = memo(({
  items = [],
  selected = [],
  onChange,
  label,
  placeholder = 'Search to add…',
  emptyText = 'Nothing selected',
  maxDropdown = 8,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filteredOptions = query.trim()
    ? items.filter(i => i.toLowerCase().includes(query.toLowerCase()) && !selected.includes(i)).slice(0, maxDropdown)
    : [];

  useEffect(() => {
    const handler = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const add = (item) => {
    if (!selected.includes(item)) onChange([...selected, item]);
    setQuery('');
    setOpen(false);
  };

  const remove = (item) => onChange(selected.filter(s => s !== item));

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {/* Selected chips */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selected.map(item => (
          <span key={item} className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-xs font-semibold">
            {item}
            <button type="button" onClick={() => remove(item)} className="hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {selected.length === 0 && (
          <span className="text-xs text-gray-400 italic">{emptyText}</span>
        )}
      </div>

      {/* Search input + dropdown */}
      <div className="relative" ref={containerRef}>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-orange-300 focus-within:border-orange-400 bg-white">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
            placeholder={placeholder}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {open && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
            {filteredOptions.map(item => (
              <button key={item} type="button" onMouseDown={() => add(item)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                {item}
              </button>
            ))}
          </div>
        )}

        {open && query.trim() && filteredOptions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
            No matches found.
          </div>
        )}
      </div>
    </div>
  );
});

TagAutocomplete.displayName = 'TagAutocomplete';
export default TagAutocomplete;
