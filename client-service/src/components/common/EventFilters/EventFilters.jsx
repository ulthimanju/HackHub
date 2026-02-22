import React, { memo } from 'react';
import TagAutocomplete from '../TagAutocomplete/TagAutocomplete';

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
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150',
              isActive
                ? 'bg-brand-500 text-white border-brand-500 shadow-btn-brand'
                : 'bg-white text-ink-secondary border-surface-border hover:border-brand-300 hover:text-brand-600',
            ].join(' ')}
          >
            {tab.label}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                isActive ? 'bg-white/20 text-white' : 'bg-surface-hover text-ink-muted'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>

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
