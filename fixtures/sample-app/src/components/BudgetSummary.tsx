import React from 'react';

export default function BudgetSummary() {
  const categories = [
    { name: 'Infrastructure & Cloud', spent: 3420, budget: 5000, color: 'bg-blue-600' },
    { name: 'Marketing & Growth', spent: 1850, budget: 2500, color: 'bg-purple-600' },
    { name: 'Engineering Tools', spent: 920, budget: 1200, color: 'bg-emerald-600' }
  ];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Departmental Budgets</h3>
      <div className="space-y-4">
        {categories.map(c => {
          const percent = Math.min(100, Math.round((c.spent / c.budget) * 100));
          return (
            <div key={c.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{c.name}</span>
                <span className="text-gray-500">${c.spent} / ${c.budget} ({percent}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${c.color} rounded-full`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
