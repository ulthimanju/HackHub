import React, { useState } from 'react';

const Tabs = ({ tabs, defaultActiveTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
              activeTab === index
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            } ${index > 0 ? 'ml-8' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {tabs[activeTab] && tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;
