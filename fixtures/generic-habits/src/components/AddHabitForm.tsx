import React, { useState } from 'react';

interface AddHabitFormProps {
  onAdd: (title: string, category: 'mindfulness' | 'fitness' | 'focus') => void;
}

export default function AddHabitForm({ onAdd }: AddHabitFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'mindfulness' | 'fitness' | 'focus'>('mindfulness');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), category);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-800">Establish New Habit</h3>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Habit Name</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 20-min Morning Meditation"
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Pillar</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm"
        >
          <option value="mindfulness">Mindfulness &amp; Calm</option>
          <option value="fitness">Physical Movement</option>
          <option value="focus">Deep Focus Work</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm shadow transition-colors"
      >
        Create Routine
      </button>
    </form>
  );
}
