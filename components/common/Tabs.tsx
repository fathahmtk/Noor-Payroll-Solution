import React from 'react';

interface Tab<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  setActiveTab: (tabId: T) => void;
}

const Tabs = <T extends string>({ tabs, activeTab, setActiveTab }: TabsProps<T>) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 font-semibold text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
