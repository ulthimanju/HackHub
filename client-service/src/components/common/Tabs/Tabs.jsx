import React, { memo, useState } from 'react';
import { theme } from '../../../utils/theme';

const Tabs = memo(({ tabs, defaultActiveTab = 0, activeTab: controlledTab, onTabChange }) => {
  const [internalTab, setInternalTab] = useState(defaultActiveTab);
  const activeTab  = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = onTabChange || setInternalTab;
  return (
    <div className="w-full">
      <div className="flex gap-6 border-b border-surface-border mb-5 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => !tab.disabled && setActiveTab(index)}
            disabled={tab.disabled}
            title={tab.disabled && tab.disabledReason ? tab.disabledReason : undefined}
            className={`pb-2.5 px-0.5 text-sm font-medium border-b-2 transition-all duration-150 focus:outline-none whitespace-nowrap ${
              tab.disabled
                ? 'border-transparent text-ink-disabled cursor-not-allowed opacity-50'
                : activeTab === index ? theme.tab.active : theme.tab.inactive
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[activeTab]?.content}</div>
    </div>
  );
});

Tabs.displayName = 'Tabs';
export default Tabs;
