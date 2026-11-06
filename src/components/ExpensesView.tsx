import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { formatINR, formatDateIN } from '../utils/formatters';
import { ExpenseCategory } from '../types';
import { Search, Plus, ArrowUpRight, Trash2, Filter } from 'lucide-react';

interface ExpensesViewProps {
  onOpenNewExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenNewExpense }) => {
  const { filteredExpenses, deleteExpense } = useHospital();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredList = filteredExpenses.list.filter(exp => {
    const matchesSearch =
      exp.payeeName.toLowerCase().includes(search.toLowerCase()) ||
      exp.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      (exp.refNumber && exp.refNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Category breakdown
  const categoryTotals: { [cat: string]: number } = {};
  filteredExpenses.list.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Hospital Operating Expenses & Outflow Vouchers
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Medical Consumables</span>
            <span aria-hidden="true">·</span>
            <span>Oxygen & Biomedical Gases</span>
            <span aria-hidden="true">·</span>
            <span>Staff Salaries</span>
            <span aria-hidden="true">·</span>
            <span>Generator Diesel & AMC</span>
          </div>
        </div>

        <button
          onClick={onOpenNewExpense}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense Voucher</span>
        </button>
      </div>

      {/* Top Expense Breakdown Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">Total Period Outflow</span>
          <span className="text-xl font-bold text-rose-600 font-mono tabular-nums block mt-0.5">
            {formatINR(filteredExpenses.total)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{filteredExpenses.list.length} Paid Vouchers</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">Medical & Implants</span>
          <span className="text-xl font-bold text-slate-800 font-mono tabular-nums block mt-0.5">
            {formatINR(categoryTotals['Medical Supplies & Implants'] || 0)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Sutures, Gloves, Implants</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">Oxygen & Bio-Gas</span>
          <span className="text-xl font-bold text-slate-800 font-mono tabular-nums block mt-0.5">
            {formatINR(categoryTotals['Oxygen & Biomedical Gas'] || 0)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Bulk cylinder refills</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">Power, Diesel & AMC</span>
          <span className="text-xl font-bold text-slate-800 font-mono tabular-nums block mt-0.5">
            {formatINR((categoryTotals['Hospital Electricity & Diesel'] || 0) + (categoryTotals['Equipment AMC & Repairs'] || 0))}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Facility maintenance</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Payee, Voucher # (e.g. MMH/EXP/0141), description or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="All">All Categories ({filteredExpenses.list.length})</option>
            {Object.keys(categoryTotals).map(cat => (
              <option key={cat} value={cat}>
                {cat} ({formatINR(categoryTotals[cat])})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Voucher # & Date</th>
                <th className="py-3 px-4">Payee / Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Approved By</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No expense vouchers found matching filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-900 block">{exp.voucherNo}</span>
                      <span className="text-[11px] text-slate-400">{formatDateIN(exp.date)}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {exp.payeeName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-medium">{exp.category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={exp.description}>
                      {exp.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium block">{exp.paymentMode}</span>
                      {exp.refNumber && (
                        <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[120px]">
                          {exp.refNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {exp.approvedBy}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete voucher ${exp.voucherNo}?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Delete voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
