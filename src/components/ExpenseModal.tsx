import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { ExpenseCategory } from '../types';
import { formatINR } from '../utils/formatters';
import { X, ArrowUpRight } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Medical Supplies & Implants',
  'Pharmacy Distributor',
  'Oxygen & Biomedical Gas',
  'Doctor Share Payout',
  'Staff & Nurse Salaries',
  'Hospital Electricity & Diesel',
  'Biomedical Waste & Infection Control',
  'Equipment AMC & Repairs',
  'Housekeeping & Canteen',
  'Administrative & Printing',
  'Taxes & Statutory Fees',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, profile } = useHospital();

  const [date, setDate] = useState('2026-11-01');
  const [category, setCategory] = useState<ExpenseCategory>('Medical Supplies & Implants');
  const [payeeName, setPayeeName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank Transfer (SBI)' | 'Bank Transfer (HDFC)' | 'Cheque' | 'UPI'>('Cash');
  const [refNumber, setRefNumber] = useState('');
  const [approvedBy, setApprovedBy] = useState(profile.directorName);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeName.trim() || amount <= 0) {
      alert('Please enter a valid payee name and positive expense amount.');
      return;
    }

    addExpense({
      date,
      category,
      payeeName: payeeName.trim(),
      description: description.trim() || `${category} payment to ${payeeName}`,
      amount: Number(amount),
      paymentMode,
      refNumber: refNumber.trim() || undefined,
      approvedBy,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold uppercase tracking-wider">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Outflow Voucher</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Record Hospital Operating Expense
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Voucher Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Expense Head / Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Vendor / Payee / Beneficiary Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sahyadri Industrial Gases / Medico Surgicals"
              value={payeeName}
              onChange={e => setPayeeName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Amount Paid (₹) *</label>
              <input
                type="number"
                min={1}
                required
                value={amount || ''}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="₹ 0"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
              >
                <option value="Cash">Cash (Counter Safe)</option>
                <option value="Bank Transfer (SBI)">Bank Transfer (SBI)</option>
                <option value="Bank Transfer (HDFC)">Bank Transfer (HDFC)</option>
                <option value="UPI">UPI / QR</option>
                <option value="Cheque">Hospital Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Bill / Invoice / UTR / Cheque Ref #</label>
            <input
              type="text"
              placeholder="e.g. INVOICE-8491 or UTR 910248201"
              value={refNumber}
              onChange={e => setRefNumber(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Voucher Description / Items Procured</label>
            <textarea
              rows={2}
              placeholder="Details of materials, services, fuel quantity, or repair work done..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Approved By</label>
              <input
                type="text"
                value={approvedBy}
                onChange={e => setApprovedBy(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Internal Note / Remarks</label>
              <input
                type="text"
                placeholder="Optional notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-mono">
              Total: {formatINR(amount)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
              >
                Save Expense Voucher
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
