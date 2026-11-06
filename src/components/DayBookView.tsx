import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { CashbookEntry, ShiftCloseRecord } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Calculator,
  Calendar,
  X,
  Printer
} from 'lucide-react';

export const DayBookView: React.FC = () => {
  const { cashbook, addCashbookEntry, shiftRecords, addShiftRecord, summary, profile } = useHospital();

  const [accountFilter, setAccountFilter] = useState<'All' | 'Cash-in-Hand' | 'SBI Main Account' | 'HDFC Current Account'>('All');
  const [contraModalOpen, setContraModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);

  // New Voucher State
  const [vType, setVType] = useState<'Receipt' | 'Payment' | 'Contra'>('Receipt');
  const [vAccount, setVAccount] = useState<'Cash-in-Hand' | 'SBI Main Account' | 'HDFC Current Account'>('Cash-in-Hand');
  const [vAmount, setVAmount] = useState<number>(0);
  const [vNarration, setVNarration] = useState('');
  const [vCounter, setVCounter] = useState('Main Accounts');

  // Shift Denomination state
  const [shiftName, setShiftName] = useState<'Morning (8AM - 2PM)' | 'Evening (2PM - 8PM)' | 'Night (8PM - 8AM)'>('Morning (8AM - 2PM)');
  const [cashierName, setCashierName] = useState('Mahesh Jadhav');
  const [denominations, setDenominations] = useState({
    note500: 0,
    note200: 0,
    note100: 0,
    note50: 0,
    note20: 0,
    note10: 0,
    coins: 0,
  });
  const [shiftNotes, setShiftNotes] = useState('All physical cash tallied with counter register.');

  // Calculate physical total
  const physicalTotal =
    (denominations.note500 * 500) +
    (denominations.note200 * 200) +
    (denominations.note100 * 100) +
    (denominations.note50 * 50) +
    (denominations.note20 * 20) +
    (denominations.note10 * 10) +
    denominations.coins;

  const expectedCashBalance = summary.cashInHandEst;
  const discrepancy = physicalTotal - expectedCashBalance;

  const filteredEntries = cashbook.filter(entry => {
    if (accountFilter === 'All') return true;
    return entry.account === accountFilter;
  });

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (vAmount <= 0 || !vNarration.trim()) {
      alert('Please enter valid amount and narration.');
      return;
    }

    addCashbookEntry({
      type: vType,
      account: vAccount,
      counter: vCounter,
      narration: vNarration.trim(),
      amount: Number(vAmount),
    });

    setContraModalOpen(false);
    setVAmount(0);
    setVNarration('');
  };

  const handleSaveShiftClose = (e: React.FormEvent) => {
    e.preventDefault();
    addShiftRecord({
      date: new Date().toISOString().split('T')[0],
      shift: shiftName,
      cashierName,
      openingCash: 15000,
      totalCashReceipts: summary.cashCollected,
      totalCashExpenses: summary.totalExpenses,
      expectedCash: expectedCashBalance,
      denominations,
      physicalCashCounted: physicalTotal,
      difference: discrepancy,
      closingRemarks: shiftNotes,
    });

    setShiftModalOpen(false);
    alert('Shift reconciliation and cash handover recorded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Hospital Day-Book & Daily Cashbook (दिनवही)
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Real-time Cash-in-Hand Register</span>
            <span aria-hidden="true">·</span>
            <span>Bank Contra Entries</span>
            <span aria-hidden="true">·</span>
            <span>Shift Handover Denominations</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShiftModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Shift Handover & Cash Count</span>
          </button>
          <button
            onClick={() => setContraModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry / Contra</span>
          </button>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cash in hand */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Cash-in-Hand (Safe & Counter Drawers)</span>
            <span className="text-emerald-700 font-medium">Physical Liquid</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatINR(summary.cashInHandEst)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>OPD Counter 1</span>
              <span aria-hidden="true">·</span>
              <span>IPD Accounts Safe</span>
              <span aria-hidden="true">·</span>
              <span>Emergency</span>
            </div>
          </div>
        </div>

        {/* SBI Bank */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-semibold text-slate-700">SBI Primary Account</span>
            <span className="font-mono text-slate-400">A/C: {profile.sbiAccountNumber}</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-teal-900 font-mono tabular-nums">
              {formatINR(summary.sbiBalanceEst)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>IFSC: {profile.sbiIfsc}</span>
              <span aria-hidden="true">·</span>
              <span>UPI: {profile.upiId}</span>
            </div>
          </div>
        </div>

        {/* HDFC Bank */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-semibold text-slate-700">HDFC Current Account</span>
            <span className="font-mono text-slate-400">A/C: {profile.hdfcAccountNumber}</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatINR(summary.hdfcBalanceEst)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>Vendor RTGS & Equipment Purchases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Filter Segmented Control */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          {(['All', 'Cash-in-Hand', 'SBI Main Account', 'HDFC Current Account'] as const).map(acc => (
            <button
              key={acc}
              onClick={() => setAccountFilter(acc)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                accountFilter === acc
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {acc === 'All' ? 'All Accounts' : acc}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredEntries.length} chronological journal entries
        </span>
      </div>

      {/* Cashbook Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Voucher & Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Account Head</th>
                <th className="py-3 px-4">Counter</th>
                <th className="py-3 px-4">Narration / Particulars</th>
                <th className="py-3 px-4 text-right">Receipt (CR)</th>
                <th className="py-3 px-4 text-right">Payment (DR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((cb) => {
                const isReceipt = cb.type === 'Receipt';
                const isContra = cb.type === 'Contra';
                return (
                  <tr key={cb.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-900 block">{cb.voucherNo}</span>
                      <span className="text-[11px] text-slate-400">{formatDateIN(cb.date)} · {cb.time}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center text-[11px] font-semibold ${
                        isReceipt 
                          ? 'text-emerald-700' 
                          : isContra 
                          ? 'text-cyan-800' 
                          : 'text-rose-600'
                      }`}>
                        {isReceipt ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />
                        ) : isContra ? (
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                        )}
                        {cb.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {cb.account}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {cb.counter}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-sm truncate" title={cb.narration}>
                      {cb.narration}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                      {isReceipt || isContra ? (
                        <span className="text-emerald-800">+{formatINR(cb.amount)}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                      {!isReceipt && !isContra ? (
                        <span className="text-rose-600">-{formatINR(cb.amount)}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Shift Handover Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Shift Handover Log & Physical Tallies</h3>
            <span className="text-xs text-slate-500">Counter reconciliation audit trail signed by cashiers</span>
          </div>
          <button
            onClick={() => setShiftModalOpen(true)}
            className="text-xs font-semibold text-teal-800 hover:underline cursor-pointer"
          >
            + Perform New Handover
          </button>
        </div>

        <div className="space-y-3">
          {shiftRecords.map((shift) => (
            <div key={shift.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{shift.shift}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500 font-mono">{formatDateIN(shift.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-teal-800 font-medium">Cashier: {shift.cashierName}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span>₹500 x {shift.denominations.note500}</span>
                  <span>·</span>
                  <span>₹200 x {shift.denominations.note200}</span>
                  <span>·</span>
                  <span>₹100 x {shift.denominations.note100}</span>
                  <span>·</span>
                  <span>₹50 x {shift.denominations.note50}</span>
                </div>
                <p className="text-[11px] text-slate-600 italic">{shift.closingRemarks}</p>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block">Counted Cash</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {formatINR(shift.physicalCashCounted)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Discrepancy</span>
                  <span className={`font-mono font-bold text-xs ${shift.difference === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {shift.difference === 0 ? '₹0 (Exact)' : formatINR(shift.difference)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Close / Denomination Counter Modal */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Shift Handover Register</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Physical Cash Denomination Count
                </h3>
              </div>
              <button
                onClick={() => setShiftModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShiftClose} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Select Shift *</label>
                  <select
                    value={shiftName}
                    onChange={e => setShiftName(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="Morning (8AM - 2PM)">Morning (8AM - 2PM)</option>
                    <option value="Evening (2PM - 8PM)">Evening (2PM - 8PM)</option>
                    <option value="Night (8PM - 8AM)">Night (8PM - 8AM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Handover Cashier Name *</label>
                  <input
                    type="text"
                    required
                    value={cashierName}
                    onChange={e => setCashierName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              {/* Denomination Counter Grid */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-tight">
                  Count Physical Currency Notes in Drawer
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <label className="block text-slate-500 font-medium text-[11px]">₹500 Notes</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        min={0}
                        value={denominations.note500 || ''}
                        onChange={e => setDenominations({ ...denominations, note500: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full p-1 text-center font-mono font-bold border border-slate-300 rounded"
                      />
                      <span className="text-[10px] text-slate-400 font-mono min-w-[50px] text-right">
                        = {formatINR(denominations.note500 * 500)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-slate-200">
                    <label className="block text-slate-500 font-medium text-[11px]">₹200 Notes</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        min={0}
                        value={denominations.note200 || ''}
                        onChange={e => setDenominations({ ...denominations, note200: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full p-1 text-center font-mono font-bold border border-slate-300 rounded"
                      />
                      <span className="text-[10px] text-slate-400 font-mono min-w-[50px] text-right">
                        = {formatINR(denominations.note200 * 200)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-slate-200">
                    <label className="block text-slate-500 font-medium text-[11px]">₹100 Notes</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        min={0}
                        value={denominations.note100 || ''}
                        onChange={e => setDenominations({ ...denominations, note100: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full p-1 text-center font-mono font-bold border border-slate-300 rounded"
                      />
                      <span className="text-[10px] text-slate-400 font-mono min-w-[50px] text-right">
                        = {formatINR(denominations.note100 * 100)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-slate-200">
                    <label className="block text-slate-500 font-medium text-[11px]">₹50 Notes</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        min={0}
                        value={denominations.note50 || ''}
                        onChange={e => setDenominations({ ...denominations, note50: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full p-1 text-center font-mono font-bold border border-slate-300 rounded"
                      />
                      <span className="text-[10px] text-slate-400 font-mono min-w-[50px] text-right">
                        = {formatINR(denominations.note50 * 50)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-slate-200">
                    <label className="block text-slate-500 font-medium text-[11px]">₹20 & ₹10 Notes</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        min={0}
                        value={denominations.note20 || ''}
                        onChange={e => setDenominations({ ...denominations, note20: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full p-1 text-center font-mono font-bold border border-slate-300 rounded"
                      />
                      <span className="text-[10px] text-slate-400 font-mono min-w-[50px] text-right">
                        = {formatINR(denominations.note20 * 20)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-slate-200">
                    <label className="block text-slate-500 font-medium text-[11px]">Coins & Loose Cash (₹)</label>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        min={0}
                        value={denominations.coins || ''}
                        onChange={e => setDenominations({ ...denominations, coins: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full p-1 text-center font-mono font-bold border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tally Comparison */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Physical Cash Counted in Safe:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{formatINR(physicalTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Expected System Cash Ledger:</span>
                  <span className="font-mono font-medium">{formatINR(expectedCashBalance)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-slate-200">
                  <span>Cash Discrepancy / Variance:</span>
                  <span className={`font-mono text-sm ${discrepancy === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {discrepancy === 0 ? '₹0 (Perfect Tally)' : `${discrepancy > 0 ? '+' : ''}${formatINR(discrepancy)}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Handover Notes & Signature Remark</label>
                <textarea
                  rows={2}
                  value={shiftNotes}
                  onChange={e => setShiftNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShiftModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs cursor-pointer"
                >
                  Sign & Save Shift Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Voucher / Contra Entry Modal */}
      {contraModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-5 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create Cash / Contra Voucher</h3>
              <button
                onClick={() => setContraModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Voucher Type *</label>
                <select
                  value={vType}
                  onChange={e => setVType(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Receipt">Receipt (Cash / Bank Inflow)</option>
                  <option value="Payment">Payment (Cash / Bank Outflow)</option>
                  <option value="Contra">Contra (Transfer between Cash and Bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Account Head *</label>
                <select
                  value={vAccount}
                  onChange={e => setVAccount(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Cash-in-Hand">Cash-in-Hand</option>
                  <option value="SBI Main Account">SBI Main Account</option>
                  <option value="HDFC Current Account">HDFC Current Account</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={vAmount || ''}
                  onChange={e => setVAmount(parseFloat(e.target.value) || 0)}
                  placeholder="₹ 0"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Counter / Location</label>
                <input
                  type="text"
                  value={vCounter}
                  onChange={e => setVCounter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Narration / Particulars *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Cash withdrawn from SBI for emergency counter float..."
                  value={vNarration}
                  onChange={e => setVNarration(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContraModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs cursor-pointer"
                >
                  Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
