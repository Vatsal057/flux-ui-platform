import React from 'react';
import { Transaction } from './TransactionForm';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 text-sm">Recent Ledger Activity</h3>
        <span className="text-xs text-gray-500">{transactions.length} entries recorded</span>
      </div>

      <div className="divide-y divide-gray-100">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No transactions recorded yet.</div>
        ) : (
          transactions.map(item => (
            <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs text-gray-400">{item.date}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`text-sm font-bold ${
                    item.type === 'income' ? 'text-green-600' : 'text-gray-900'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onDeleteTransaction(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
