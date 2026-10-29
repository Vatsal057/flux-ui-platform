import React from 'react';

interface StreakStatsProps {
  totalActive: number;
  completedToday: number;
  longestStreak: number;
}

export default function StreakStats({ totalActive, completedToday, longestStreak }: StreakStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
        <span className="text-xs text-gray-500 font-medium">Active Routines</span>
        <p className="text-2xl font-bold text-gray-800 mt-1">{totalActive}</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
        <span className="text-xs text-gray-500 font-medium">Completed Today</span>
        <p className="text-2xl font-bold text-blue-600 mt-1">{completedToday}</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
        <span className="text-xs text-gray-500 font-medium">Longest Streak</span>
        <p className="text-2xl font-bold text-amber-500 mt-1">{longestStreak} days</p>
      </div>
    </div>
  );
}
