import React, { useState } from 'react';
import Header from './components/Header';
import HabitCard, { Habit } from './components/HabitCard';
import AddHabitForm from './components/AddHabitForm';
import StreakStats from './components/StreakStats';

export default function App() {
  const [currentTab, setCurrentTab] = useState('today');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: '15-Minute Morning Pranayama Breathwork', streak: 14, completedToday: true, category: 'mindfulness' },
    { id: '2', title: '5km Forest Trail Run', streak: 8, completedToday: false, category: 'fitness' },
    { id: '3', title: 'Deep Architectural Code Review (No Slack)', streak: 21, completedToday: true, category: 'focus' }
  ]);

  const handleToggleHabit = (id: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === id) {
          const completed = !h.completedToday;
          return {
            ...h,
            completedToday: completed,
            streak: completed ? h.streak + 1 : Math.max(0, h.streak - 1)
          };
        }
        return h;
      })
    );
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleAddHabit = (title: string, category: 'mindfulness' | 'fitness' | 'focus') => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      streak: 1,
      completedToday: false,
      category
    };
    setHabits(prev => [newHabit, ...prev]);
  };

  const filteredHabits = filterCategory === 'all'
    ? habits
    : habits.filter(h => h.category === filterCategory);

  const completedTodayCount = habits.filter(h => h.completedToday).length;
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Today’s Mindful Intentions</h2>
            <p className="text-sm text-gray-500 mt-1">
              Cultivate daily focus, physical vitality, and mental serenity.
            </p>
          </div>
          <div className="flex space-x-2">
            {['all', 'mindfulness', 'fitness', 'focus'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Streak Stats */}
        <StreakStats
          totalActive={habits.length}
          completedToday={completedTodayCount}
          longestStreak={longestStreak}
        />

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800 text-base">Your Active Commitments</h3>
              <span className="text-xs text-gray-500">{filteredHabits.length} routines shown</span>
            </div>

            {filteredHabits.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-400 border border-gray-200">
                No habits found in this category.
              </div>
            ) : (
              filteredHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={handleToggleHabit}
                  onDelete={handleDeleteHabit}
                />
              ))
            )}
          </div>

          <div>
            <AddHabitForm onAdd={handleAddHabit} />
          </div>
        </div>
      </main>
    </div>
  );
}
