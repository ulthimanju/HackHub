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
      <label className="block text-sm font-bold text-gray-700 tracking-wide uppercase">Skills & Technologies</label>

      {/* Search input */}
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search skills to add…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {open && available.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 sticky top-0">
                  {cat}
                </div>
                {items.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onMouseDown={() => handleSelect(skill)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {open && query.length > 0 && available.length === 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
            No matching skills found.
          </div>
        )}
      </div>

      {/* Selected skill tags */}
      <div className="flex flex-wrap gap-2 p-5 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 min-h-[80px] transition-all hover:border-orange-200 hover:bg-orange-50/10">
        {skills.map(skill => (
          <span
            key={skill}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-xl text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-orange-300 hover:text-orange-600 group cursor-pointer"
            onClick={() => onRemoveSkill(skill)}
          >
            {skill}
            <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-gray-400 text-sm italic py-2 px-1">No skills added yet. Search above to add some!</p>
        )}
      </div>
    </div>
  );
});
SkillTags.displayName = 'SkillTags';
export default SkillTags;

