import React from 'react';

interface MetricCardProps {
  title: string;
  amount: number;
  change: string;
  isPositive?: boolean;
}

export default function MetricCard({ title, amount, change, isPositive = true }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {change}
        </span>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-gray-900">
          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h3>
        <p className="text-xs text-gray-400 mt-1">Compared to previous month</p>
      </div>
    </div>
  );
}
