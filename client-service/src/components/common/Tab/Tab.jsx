import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const Tab = memo(({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`pb-2.5 px-0.5 text-sm font-medium border-b-2 transition-all duration-150 focus:outline-none whitespace-nowrap ${
      active ? theme.tab.active : theme.tab.inactive
    }`}
  >
    {children}
    {count !== undefined && (
      <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium ${
        active ? 'bg-brand-100 text-brand-700' : 'bg-surface-hover text-ink-muted'
      }`}>
        {count}
      </span>
    )}
  </button>
));

Tab.displayName = 'Tab';
export default Tab;
