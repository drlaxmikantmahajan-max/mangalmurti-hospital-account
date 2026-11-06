import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { formatINR } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Receipt, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Building,
  CreditCard
} from 'lucide-react';
import { PatientInvoice } from '../types';

interface DashboardViewProps {
  onViewInvoice: (inv: PatientInvoice) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onViewInvoice,
  onNavigateTab,
}) => {
  const { summary, filteredInvoices, filteredExpenses, doctors, dateFilter } = useHospital();

  // Compute departmental revenue
  const departmentRevenue: { [key: string]: number } = {};
  filteredInvoices.forEach(inv => {
    inv.items.forEach(item => {
      departmentRevenue[item.category] = (departmentRevenue[item.category] || 0) + item.amount;
    });
  });

  const deptEntries = Object.entries(departmentRevenue).sort((a, b) => b[1] - a[1]);
  const totalDeptRevenue = deptEntries.reduce((sum, [, val]) => sum + val, 0) || 1;

  // Recent 5 invoices
  const recentInvoices = filteredInvoices.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Context Notice */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teal-300 font-medium tracking-wide uppercase">
            <span>Hospital Accounts Ledger</span>
            <span aria-hidden="true">·</span>
            <span>Fiscal Year 2026-27</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Financial Health & Collection Pulse
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Consolidated overview of OPD consultations, OT surgical packages, room admissions, distributor pharmacy expenses, and doctor consultation shares under Chief Medical Officer Dr. Laxmikant Mahajan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => onNavigateTab('invoices')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
          >
            Review Bills ({filteredInvoices.length})
          </button>
          <button
            onClick={() => onNavigateTab('doctors')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Doctor Settlements
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collections */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Total Patient Collection</span>
            <span className="text-emerald-700 flex items-center font-semibold">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              Inflow
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatINR(summary.totalCollected)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>Gross Billed: {formatINR(summary.grossBilled)}</span>
              <span aria-hidden="true">·</span>
              <span>{summary.opdCount} OPD / {summary.ipdCount} IPD</span>
            </div>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Operating Expenses</span>
            <span className="text-rose-600 flex items-center font-semibold">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              Outflow
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatINR(summary.totalExpenses)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>Vouchers: {filteredExpenses.list.length}</span>
              <span aria-hidden="true">·</span>
              <span>Supplies, Fuel, AMC & Meds</span>
            </div>
          </div>
        </div>

        {/* Net Operating Surplus */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Net Operating Surplus</span>
            <span className="text-teal-700 font-semibold text-xs">EBIDTA</span>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${summary.netOperatingSurplus >= 0 ? 'text-teal-800' : 'text-rose-600'}`}>
              {formatINR(summary.netOperatingSurplus)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>Margin: {summary.totalCollected > 0 ? ((summary.netOperatingSurplus / summary.totalCollected) * 100).toFixed(1) : '0'}%</span>
              <span aria-hidden="true">·</span>
              <span>After Direct Outflows</span>
            </div>
          </div>
        </div>

        {/* Doctor Share Pending */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Doctor Share Liability</span>
            <span className="text-amber-600 font-semibold text-xs">Unsettled</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-amber-700 font-mono tabular-nums">
              {formatINR(summary.doctorPendingShares)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>{doctors.length} Doctors</span>
              <span aria-hidden="true">·</span>
              <button 
                onClick={() => onNavigateTab('doctors')}
                className="text-teal-800 hover:underline font-medium cursor-pointer"
              >
                Settle Payouts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inflow Channels & Liquidity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Channels Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-800" />
                Collection By Payment Method
              </h3>
              <span className="text-xs text-slate-500">Live Counters</span>
            </div>

            <div className="space-y-3.5 mt-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="font-medium text-slate-700">Cash Counter (OPD/Emergency)</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{formatINR(summary.cashCollected)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="font-medium text-slate-700">UPI / QR (GPay / PhonePe)</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{formatINR(summary.upiCollected)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                  <span className="font-medium text-slate-700">Bank Transfer / Card (SBI/HDFC)</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{formatINR(summary.bankCollected)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span className="font-medium text-slate-700">TPA & Insurance Claims Approved</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{formatINR(summary.tpaApproved)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Uncollected Patient Dues:</span>
            <span className="font-mono font-semibold text-rose-600 tabular-nums">{formatINR(summary.uncollectedDues)}</span>
          </div>
        </div>

        {/* Department-wise Clinical Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-800" />
                Department Revenue Contribution
              </h3>
              <span className="text-xs text-slate-500">{deptEntries.length} Units</span>
            </div>

            <div className="space-y-3 mt-4">
              {deptEntries.slice(0, 5).map(([dept, amount]) => {
                const percent = Math.round((amount / totalDeptRevenue) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate max-w-[180px]">{dept}</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {formatINR(amount)} <span className="text-slate-400 font-normal">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-teal-700 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Clinical Subtotal:</span>
            <span className="font-mono font-semibold text-slate-900">{formatINR(totalDeptRevenue)}</span>
          </div>
        </div>

        {/* Bank & Liquidity Vault */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-800" />
                Cash & Bank Balances
              </h3>
              <span className="text-xs text-emerald-700 font-semibold">Audited</span>
            </div>

            <div className="space-y-3.5 mt-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Cash-in-Hand (Counter Safe)</span>
                  <span className="font-mono text-slate-400">Main + ER</span>
                </div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {formatINR(summary.cashInHandEst)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>State Bank of India (Primary)</span>
                  <span className="font-mono text-slate-400">A/C: ...4821</span>
                </div>
                <div className="text-lg font-bold text-teal-900 font-mono mt-0.5">
                  {formatINR(summary.sbiBalanceEst)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>HDFC Bank (Current A/C)</span>
                  <span className="font-mono text-slate-400">A/C: ...1823</span>
                </div>
                <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                  {formatINR(summary.hdfcBalanceEst)}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('daybook')}
            className="mt-4 w-full py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-center cursor-pointer"
          >
            Open Daily Cashbook & Shift Handover
          </button>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Patient Invoices & Collections</h3>
            <p className="text-xs text-slate-500">Latest billings generated at OPD, IPD, and Emergency counters</p>
          </div>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All ({filteredInvoices.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4">Invoice # & Date</th>
                <th className="py-2.5 px-4">Patient / UHID</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Primary Doctor</th>
                <th className="py-2.5 px-4 text-right">Total Bill</th>
                <th className="py-2.5 px-4 text-right">Collected</th>
                <th className="py-2.5 px-4 text-right">Balance Due</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-slate-900 block">{inv.invoiceNo}</span>
                    <span className="text-[11px] text-slate-400">{inv.date} · {inv.time}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{inv.patientName}</span>
                    <span className="text-[11px] text-slate-500">{inv.uhid} · {inv.gender}, {inv.age}y</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-700 font-medium">
                      {inv.patientType} {inv.wardBedNo ? `(${inv.wardBedNo.split('-')[0]})` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {inv.primaryDoctorName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                    {formatINR(inv.grandTotal)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-800 tabular-nums">
                    {formatINR(inv.amountPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium tabular-nums">
                    {inv.balanceDue > 0 ? (
                      <span className="text-rose-600">{formatINR(inv.balanceDue)}</span>
                    ) : (
                      <span className="text-slate-400">₹0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center text-[11px] font-medium ${
                      inv.status === 'Paid' 
                        ? 'text-emerald-700' 
                        : inv.status === 'Partial' 
                        ? 'text-amber-700' 
                        : 'text-rose-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        inv.status === 'Paid' 
                          ? 'bg-emerald-600' 
                          : inv.status === 'Partial' 
                          ? 'bg-amber-500' 
                          : 'bg-rose-500'
                      }`} />
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onViewInvoice(inv)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                    >
                      View / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
