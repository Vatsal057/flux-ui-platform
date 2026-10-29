import React from 'react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ currentTab, onTabChange }: HeaderProps) {
  const tabs = ['today', 'analytics', 'habits', 'settings'];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          HZ
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">HabitZen Tracker</h1>
          <p className="text-xs text-gray-500">Daily routine &amp; mindfulness tracker</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
              currentTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow">
        Quick Check-in
      </button>
    </header>
  );
}
