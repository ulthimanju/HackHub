import React, { memo, useState } from 'react';
import { theme } from '../../../../utils/theme';

const Tabs = memo(({ tabs, defaultActiveTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors focus:outline-none ${index > 0 ? 'ml-8' : ''} ${activeTab === index ? theme.tab.active : theme.tab.inactive}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-4">{tabs[activeTab]?.content}</div>
    </div>
  );
});
Tabs.displayName = 'Tabs';
export default Tabs;
