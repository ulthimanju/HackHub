import React, { memo } from 'react';
import { theme } from '../../../../utils/theme';

const Tab = memo(({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors focus:outline-none ${active ? theme.tab.active : theme.tab.inactive}`}
  >
    {children}
  </button>
));
Tab.displayName = 'Tab';
export default Tab;
