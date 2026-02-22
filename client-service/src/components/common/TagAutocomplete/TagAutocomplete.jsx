import React, { useState, useRef, useEffect, memo } from 'react';
import { Search, X } from 'lucide-react';

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
      {label && <label className="block text-xs font-medium text-ink-muted uppercase tracking-wide">{label}</label>}

      {/* Selected chips */}
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-0.5 rounded-full text-xs font-medium"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                className="hover:text-red-500 transition-colors focus:outline-none"
                aria-label={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-muted italic">{emptyText}</p>
      )}

      {/* Search input + dropdown */}
      <div className="relative" ref={containerRef}>
        <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 bg-white transition-all duration-150 ${
          open ? 'border-brand-500 ring-2 ring-brand-500/25' : 'border-surface-border hover:border-ink-muted/40'
        }`}>
          <Search className="w-3.5 h-3.5 text-ink-muted shrink-0" />
          <input
            className="flex-1 text-sm text-ink-secondary outline-none placeholder-ink-muted/60 bg-transparent min-w-0"
            placeholder={placeholder}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setOpen(false); }}
              className="text-ink-muted hover:text-ink-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {open && filteredOptions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-surface-border rounded-lg shadow-dropdown overflow-hidden">
            {filteredOptions.map(item => (
              <button
                key={item}
                type="button"
                onMouseDown={() => add(item)}
                className="w-full text-left px-3 py-2 text-sm text-ink-secondary hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {open && query.trim() && filteredOptions.length === 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-surface-border rounded-lg shadow-dropdown px-3 py-2.5 text-sm text-ink-muted">
            No matches found.
          </div>
        )}
      </div>
    </div>
  );
});

TagAutocomplete.displayName = 'TagAutocomplete';
export default TagAutocomplete;
