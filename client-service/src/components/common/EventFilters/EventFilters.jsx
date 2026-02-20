import React, { memo } from 'react';
import TagAutocomplete from '../TagAutocomplete/TagAutocomplete';

/**
 * Reusable event filter bar: status tabs + theme autocomplete.
 *
 * Props:
 *   tabs          – { label, value }[] — status tab definitions
 *   activeTab     – string — currently active tab value
 *   onTabChange   – fn(value)
 *   tabCounts     – { [value]: number } — badge counts per tab
 *   themeItems    – string[] — all available themes
 *   activeThemes  – string[] — selected theme filters
 *   onThemesChange– fn(string[])
 */
const EventFilters = memo(({
  tabs = [],
  activeTab,
  onTabChange,
  tabCounts = {},
  themeItems = [],
  activeThemes = [],
  onThemesChange,
}) => (
  <div className="space-y-3">
    {/* Status tabs */}
    <div className="flex gap-2 flex-wrap">
      {tabs.map(tab => {
        const count = tabCounts[tab.value] ?? 0;
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              isActive
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {tab.label}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>

    {/* Theme filter */}
    {themeItems.length > 0 && (
      <div className="w-72">
        <TagAutocomplete
          items={themeItems}
          selected={activeThemes}
          onChange={onThemesChange}
          placeholder="Filter by theme…"
          emptyText=""
        />
      </div>
    )}
  </div>
));

EventFilters.displayName = 'EventFilters';
export default EventFilters;
