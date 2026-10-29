import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MetricCard from './components/MetricCard';
import TransactionForm, { Transaction } from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetSummary from './components/BudgetSummary';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'AWS Cloud Infrastructure', amount: 840.50, category: 'Infrastructure', date: '2026-10-28', type: 'expense' },
    { id: '2', description: 'Enterprise Retainer Q4', amount: 6500.00, category: 'Revenue', date: '2026-10-27', type: 'income' },
    { id: '3', description: 'Team Figma & GitHub Seats', amount: 180.00, category: 'Operations', date: '2026-10-25', type: 'expense' }
  ]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = 42500 + totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Executive Balance &amp; Treasury
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live corporate runway, departmental budget allocations, and expense streams.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              Audit Logs
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              New Transfer
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Liquid Treasury Balance"
            amount={netBalance}
            change="+12.4%"
            isPositive={true}
          />
          <MetricCard
            title="Monthly Revenue Inflow"
            amount={totalIncome}
            change="+8.1%"
            isPositive={true}
          />
          <MetricCard
            title="Operating Expenses"
            amount={totalExpense}
            change="-3.2%"
            isPositive={false}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>

          <div className="space-y-6">
            <TransactionForm onAddTransaction={handleAddTransaction} />
            <BudgetSummary />
          </div>
        </div>
      </main>
    </div>
  );
}
