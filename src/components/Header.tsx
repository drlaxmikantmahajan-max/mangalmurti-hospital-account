import React from 'react';
import { useHospital, DateFilterType } from '../context/HospitalContext';
import { 
  Building2, 
  Plus, 
  Receipt, 
  ArrowUpRight, 
  Calendar,
  Wallet,
  Activity,
  FileText
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
  onOpenAPKModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewInvoice,
  onOpenNewExpense,
  onOpenAPKModal,
}) => {
  const { profile, dateFilter, setDateFilter, summary } = useHospital();

  const navItems = [
    { id: 'dashboard', label: 'Financial Pulse', icon: Activity },
    { id: 'invoices', label: 'Patient Billing (OPD/IPD)', icon: Receipt },
    { id: 'expenses', label: 'Hospital Expenses', icon: ArrowUpRight },
    { id: 'doctors', label: 'Doctor Share & Payout', icon: Building2 },
    { id: 'daybook', label: 'Day-Book & Cashbook', icon: Wallet },
    { id: 'reports', label: 'P&L & Audit Reports', icon: FileText },
    { id: 'settings', label: 'Hospital Master & Backup', icon: Calendar },
  ];

  const dateFilterOptions: { id: DateFilterType; label: string }[] = [
    { id: 'today', label: 'Today (01 Nov)' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7days', label: 'Last 7 Days' },
    { id: 'month', label: 'Oct-Nov 2026' },
    { id: 'all', label: 'All Records' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Hospital Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-xs ring-4 ring-teal-50">
            <span>MM</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                {profile.name}
              </h1>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {profile.marathiName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Director: {profile.directorName}</span>
              <span aria-hidden="true">·</span>
              <span>Reg: {profile.hospitalRegNo}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">GSTIN: {profile.gstin}</span>
            </div>
          </div>
        </div>

        {/* Quick Balance Indicators and Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Cash-in-Hand</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{formatINR(summary.cashInHandEst)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Bank (SBI)</span>
              <span className="font-semibold text-teal-800 font-mono tabular-nums">{formatINR(summary.sbiBalanceEst)}</span>
            </div>
          </div>

          <PWAInstallButton onOpenAPKModal={onOpenAPKModal} />

          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Patient Bill</span>
          </button>

          <button
            onClick={onOpenNewExpense}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Navigation and Date Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 overflow-x-auto">
        <nav className="flex space-x-1 py-1.5 overflow-x-auto scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-800' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Date Filter Segmented Control */}
        <div className="flex items-center gap-1 py-1.5 self-end md:self-center">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden lg:inline">Period:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {dateFilterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateFilter(opt.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                  dateFilter === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
