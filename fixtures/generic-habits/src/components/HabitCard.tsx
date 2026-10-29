import React from 'react';

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
  category: 'mindfulness' | 'fitness' | 'focus';
}

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onToggle(habit.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            habit.completedToday
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {habit.completedToday && <span className="text-xs">✓</span>}
        </button>
        <div>
          <h4 className={`text-base font-semibold ${habit.completedToday ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {habit.title}
          </h4>
          <span className="text-xs text-blue-500 font-medium uppercase tracking-wide">
            {habit.category}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
          🔥 {habit.streak} days
        </span>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
