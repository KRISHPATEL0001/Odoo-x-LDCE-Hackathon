import React, { useState, useEffect } from 'react';
import { Trip } from '../../types.ts';
import { api } from '../../services/api.ts';
import {
  Wallet,
  PieChart,
  Plus,
  ArrowUpRight,
  TrendingDown,
  CreditCard,
  Receipt,
  DollarSign,
  Utensils,
  Plane,
  Building,
  Camera,
  ShoppingBag,
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  tripId: string;
  category: 'Flights' | 'Lodging' | 'Dining' | 'Activities' | 'Shopping';
  title: string;
  amount: number;
  date: string;
}

interface BudgetPlannerViewProps {
  trips: Trip[];
  currency: string;
  onChangeCurrency: (curr: string) => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  trips,
  currency,
  onChangeCurrency,
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(
    trips[0]?.id || ''
  );

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number>(2000);
  const [newCategory, setNewCategory] = useState<ExpenseItem['category']>('Dining');

  // Keep selectedTripId in sync with available trips
  useEffect(() => {
    if (trips.length > 0) {
      if (!selectedTripId || !trips.some((t) => t.id === selectedTripId)) {
        setSelectedTripId(trips[0].id);
      }
    } else {
      setSelectedTripId('');
      setExpenses([]);
    }
  }, [trips, selectedTripId]);

  // Load expenses from Backend when trip changes
  useEffect(() => {
    async function loadTripExpenses() {
      if (selectedTripId) {
        try {
          const fetched = await api.getExpenses(selectedTripId);
          setExpenses(fetched || []);
        } catch {
          setExpenses([]);
        }
      } else {
        setExpenses([]);
      }
    }
    loadTripExpenses();
  }, [selectedTripId]);

  const currentTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
  const tripExpenses = expenses.filter((e) => e.tripId === selectedTripId);

  const totalSpent = tripExpenses.reduce((acc, e) => acc + e.amount, 0);
  const budget = currentTrip ? currentTrip.budget : 100000;
  const remaining = Math.max(0, budget - totalSpent);
  const percentUsed = Math.min(100, Math.round((totalSpent / budget) * 100));

  const categories = [
    { name: 'Flights', icon: Plane, color: 'bg-sky-600', text: 'text-sky-700' },
    { name: 'Lodging', icon: Building, color: 'bg-[#5d6d5a]', text: 'text-[#5d6d5a]' },
    { name: 'Activities', icon: Camera, color: 'bg-[#d4a373]', text: 'text-[#d4a373]' },
    { name: 'Dining', icon: Utensils, color: 'bg-rose-500', text: 'text-rose-600' },
    { name: 'Shopping', icon: ShoppingBag, color: 'bg-purple-600', text: 'text-purple-700' },
  ];

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const expenseData = {
      category: newCategory,
      title: newTitle.trim(),
      amount: Number(newAmount) || 0,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    try {
      const created = await api.createExpense(selectedTripId, expenseData);
      setExpenses((prev) => [created || { ...expenseData, id: `exp-${Date.now()}`, tripId: selectedTripId }, ...prev]);
    } catch {
      const newItem: ExpenseItem = {
        id: `exp-${Date.now()}`,
        tripId: selectedTripId,
        category: newCategory,
        title: newTitle.trim(),
        amount: Number(newAmount) || 0,
        date: expenseData.date,
      };
      setExpenses([newItem, ...expenses]);
    }

    setNewTitle('');
    setShowAddExpense(false);
  };

  if (trips.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
              <Wallet className="w-3.5 h-3.5 text-[#d4a373]" />
              Travel Expense &amp; Budget Tracker
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
              Smart Trip Budget Planner
            </h2>
            <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1 max-w-xl">
              Keep expenses on track, monitor category caps, and itemize travel receipts.
            </p>
          </div>
        </div>

        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-12 sm:p-16 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#5d6d5a]/10 text-[#5d6d5a] flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-[#5d6d5a]" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#2d3436] mb-1.5">
            No Active Trips Planned Yet
          </h3>
          <p className="text-xs sm:text-sm text-[#7f8c8d] max-w-md">
            Once you create a journey, you will be able to log receipts, allocate budgets for flights, lodging, dining, and activities, and monitor your spend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#f5f5f0] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5d6d5a] mb-2">
            <Wallet className="w-3.5 h-3.5 text-[#d4a373]" />
            Travel Expense &amp; Budget Tracker
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436]">
            Smart Trip Budget Planner
          </h2>
          <p className="text-xs sm:text-sm text-[#7f8c8d] mt-1">
            Keep expenses on track, monitor category caps, and avoid surprise costs.
          </p>
        </div>

        {/* Currency & Trip Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#e0e0d5] rounded-xl text-xs font-semibold text-[#2d3436] focus:outline-none focus:border-[#5d6d5a]"
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag} {t.title}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-white border border-[#e0e0d5] rounded-xl p-1 text-xs">
            {['₹', '$', '€', '£', '¥'].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onChangeCurrency(curr)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currency === curr
                    ? 'bg-[#5d6d5a] text-white shadow-xs'
                    : 'text-[#7f8c8d] hover:text-[#2d3436]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="px-4 py-2 bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d]">
            Total Allocated Budget
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2d3436] mt-1">
            {currency}
            {budget.toLocaleString()}
          </div>
          <span className="text-xs text-[#5d6d5a] mt-1 inline-block">
            Target cap for {currentTrip?.destination}
          </span>
        </div>

        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d]">
            Total Recorded Spend
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5d6d5a] mt-1">
            {currency}
            {totalSpent.toLocaleString()}
          </div>
          <span className="text-xs text-[#7f8c8d] mt-1 inline-block">
            {percentUsed}% of total budget used
          </span>
        </div>

        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d]">
            Remaining Funds
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#d4a373] mt-1">
            {currency}
            {remaining.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-700 mt-1 inline-block font-medium">
            Available for food &amp; local leisure
          </span>
        </div>
      </div>

      {/* Progress Bar of Budget Utilization */}
      <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#2d3436] mb-2">
          <span>Overall Budget Consumption</span>
          <span>{percentUsed}%</span>
        </div>
        <div className="w-full h-3 bg-[#f5f5f0] rounded-full overflow-hidden flex">
          <div
            className="bg-[#5d6d5a] h-full transition-all duration-500"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown & Expense History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5">
          <h3 className="font-serif font-bold text-lg text-[#2d3436] mb-4">
            Category Breakdown
          </h3>
          <div className="space-y-3.5">
            {categories.map((cat) => {
              const catTotal = tripExpenses
                .filter((e) => e.category === cat.name)
                .reduce((a, b) => a + b.amount, 0);
              const catPercent =
                totalSpent > 0 ? Math.round((catTotal / totalSpent) * 100) : 0;
              const Icon = cat.icon;

              return (
                <div key={cat.name} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 font-medium text-[#2d3436]">
                      <Icon className={`w-3.5 h-3.5 ${cat.text}`} />
                      {cat.name}
                    </span>
                    <span className="font-bold text-[#2d3436]">
                      {currency}
                      {catTotal.toLocaleString()} ({catPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f5f5f0] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full`}
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-[#fdfcf8] border border-[#e0e0d5] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-lg text-[#2d3436]">
              Logged Travel Receipts ({tripExpenses.length})
            </h3>
            <span className="text-xs text-[#7f8c8d]">Sorted by recent</span>
          </div>

          {tripExpenses.length === 0 ? (
            <div className="py-8 text-center text-[#7f8c8d]">
              <Receipt className="w-8 h-8 mx-auto text-[#d4a373] mb-2" />
              <p className="text-xs">No receipts logged for this trip yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e0e0d5]/60">
              {tripExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="py-3 flex items-center justify-between hover:bg-[#f5f5f0]/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#f5f5f0] text-[#5d6d5a] flex items-center justify-center font-bold text-xs">
                      {exp.category.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-[#2d3436]">
                        {exp.title}
                      </p>
                      <p className="text-[11px] text-[#7f8c8d]">
                        {exp.category} • {exp.date}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-[#2d3436]">
                    {currency}
                    {exp.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-[#2d3436] mb-1">
              Log Trip Expense
            </h3>
            <p className="text-xs text-[#7f8c8d] mb-4">
              Add a flight, hotel, or food receipt to {currentTrip.title}.
            </p>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Traditional Swiss Raclette Feast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as ExpenseItem['category'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                  >
                    <option value="Dining">Dining</option>
                    <option value="Lodging">Lodging</option>
                    <option value="Flights">Flights</option>
                    <option value="Activities">Activities</option>
                    <option value="Shopping">Shopping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#7f8c8d] mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e0d5] bg-white text-sm focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e0e0d5]">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7f8c8d] hover:bg-[#f5f5f0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] text-xs font-semibold shadow-sm"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
