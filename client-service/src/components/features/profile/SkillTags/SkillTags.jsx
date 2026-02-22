import React, { memo, useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { ALL_SKILLS, SKILL_CATEGORIES } from '../../../../constants/skills';

const SkillTags = memo(({ skills, onAddSkill, onRemoveSkill }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const available = ALL_SKILLS.filter(
    s => !skills.includes(s) && s.toLowerCase().includes(query.toLowerCase())
  );

  // Group filtered results by category
  const grouped = Object.entries(SKILL_CATEGORIES).reduce((acc, [cat, items]) => {
    const filtered = items.filter(s => !skills.includes(s) && s.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length) acc[cat] = filtered;
    return acc;
  }, {});

  useEffect(() => {
    const handler = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (skill) => {
    onAddSkill(skill);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-ink-secondary uppercase tracking-wide">Skills & Technologies</label>

      {/* Search input */}
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search skills to add…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-border text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {open && available.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-surface-border rounded-lg shadow-dropdown max-h-64 overflow-y-auto">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="px-3 py-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wide bg-surface-hover sticky top-0">
                  {cat}
                </div>
                {items.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onMouseDown={() => handleSelect(skill)}
                    className="w-full text-left px-4 py-2 text-sm text-ink-secondary hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {open && query.length > 0 && available.length === 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-surface-border rounded-lg shadow-dropdown px-4 py-3 text-sm text-ink-muted">
            No matching skills found.
          </div>
        )}
      </div>

      {/* Selected skill tags */}
      <div className="flex flex-wrap gap-2 p-5 bg-surface-hover/50 rounded-xl border border-dashed border-surface-border min-h-20 transition-all hover:border-brand-200 hover:bg-brand-50/10">
        {skills.map(skill => (
          <span
            key={skill}
            className="flex items-center gap-2 bg-white border border-surface-border px-4 py-1.5 rounded-lg text-sm font-medium text-ink-secondary shadow-card transition-all hover:border-brand-300 hover:text-brand-600 group cursor-pointer"
            onClick={() => onRemoveSkill(skill)}
          >
            {skill}
            <X className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-500 transition-colors" />
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-ink-muted text-sm italic py-2 px-1">No skills added yet. Search above to add some!</p>
        )}
      </div>
    </div>
  );
});
SkillTags.displayName = 'SkillTags';
export default SkillTags;

