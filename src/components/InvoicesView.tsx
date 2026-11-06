import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { PatientInvoice, PaymentMode } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { 
  Search, 
  Plus, 
  Printer, 
  DollarSign, 
  Filter, 
  User, 
  FileText,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

interface InvoicesViewProps {
  onOpenNewInvoice: () => void;
  onViewInvoice: (inv: PatientInvoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onOpenNewInvoice,
  onViewInvoice,
}) => {
  const { filteredInvoices, collectInvoicePayment, deleteInvoice } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'OPD' | 'IPD' | 'Emergency' | 'DayCare'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Due'>('All');

  // Quick payment collection modal state
  const [collectModalInv, setCollectModalInv] = useState<PatientInvoice | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMode, setCollectMode] = useState<PaymentMode>('Cash');
  const [collectRef, setCollectRef] = useState<string>('');

  const filtered = filteredInvoices.filter(inv => {
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.mobile.includes(searchQuery) ||
      inv.primaryDoctorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'All' || inv.patientType === typeFilter;
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenCollect = (inv: PatientInvoice) => {
    setCollectModalInv(inv);
    setCollectAmount(inv.balanceDue);
    setCollectMode('Cash');
    setCollectRef('');
  };

  const handleConfirmCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalInv || collectAmount <= 0) return;
    collectInvoicePayment(collectModalInv.id, collectAmount, collectMode, collectRef);
    setCollectModalInv(null);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Patient Billing & Invoices
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>OPD Consultations</span>
            <span aria-hidden="true">·</span>
            <span>IPD Surgeries & Admissions</span>
            <span aria-hidden="true">·</span>
            <span>Day Care & Casualty</span>
          </div>
        </div>

        <button
          onClick={onOpenNewInvoice}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Patient Bill</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Patient Name, UHID (e.g. MMH-P-1042), Bill #, Doctor, or Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
            {(['All', 'OPD', 'IPD', 'Emergency'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  typeFilter === type
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
            {(['All', 'Paid', 'Partial', 'Due'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bill No & Date</th>
                <th className="py-3 px-4">Patient Name & Details</th>
                <th className="py-3 px-4">Type / Ward</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No invoices matching the current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-900 block">{inv.invoiceNo}</span>
                      <span className="text-[11px] text-slate-400">{formatDateIN(inv.date)} · {inv.time}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{inv.patientName}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-mono text-teal-800">{inv.uhid}</span>
                        <span aria-hidden="true">·</span>
                        <span>{inv.gender}, {inv.age}y</span>
                        <span aria-hidden="true">·</span>
                        <span>{inv.mobile}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium block">{inv.patientType}</span>
                      {inv.wardBedNo && (
                        <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                          {inv.wardBedNo}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="block font-medium">{inv.primaryDoctorName}</span>
                      {inv.doctorShares?.length > 1 && (
                        <span className="text-[11px] text-slate-400">+{inv.doctorShares.length - 1} co-consultant(s)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-800 tabular-nums">
                      {formatINR(inv.amountPaid)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium tabular-nums">
                      {inv.balanceDue > 0 ? (
                        <span className="text-rose-600 font-semibold">{formatINR(inv.balanceDue)}</span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-medium block">{inv.paymentMode}</span>
                      {inv.paymentRef && (
                        <span className="text-[10px] text-slate-400 truncate block max-w-[120px] font-mono">
                          {inv.paymentRef}
                        </span>
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
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenCollect(inv)}
                            title="Collect Due Payment"
                            className="px-2 py-1 text-[11px] font-semibold rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
                          >
                            Collect ₹
                          </button>
                        )}
                        <button
                          onClick={() => onViewInvoice(inv)}
                          title="Print / View Invoice"
                          className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Due Payment Modal */}
      {collectModalInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Collect Due Payment
                </h3>
                <span className="text-xs text-slate-500">
                  Bill {collectModalInv.invoiceNo} · {collectModalInv.patientName}
                </span>
              </div>
              <button
                onClick={() => setCollectModalInv(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCollect} className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Grand Total:</span>
                  <span className="font-mono font-medium text-slate-800">{formatINR(collectModalInv.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Previously Paid:</span>
                  <span className="font-mono font-medium text-emerald-800">{formatINR(collectModalInv.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-semibold border-t border-slate-200 pt-1">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono text-rose-600">{formatINR(collectModalInv.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received Now (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={collectModalInv.balanceDue}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={collectMode}
                  onChange={(e) => setCollectMode(e.target.value as PaymentMode)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  <option value="Cash">Cash (Counter Safe)</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / QR)</option>
                  <option value="Card">Card (POS Swiping Machine)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS to SBI)</option>
                  <option value="TPA / Insurance">TPA / Insurance Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Transaction Reference / UTR / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref #, POS Slip #, or Cashier Note"
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCollectModalInv(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs cursor-pointer"
                >
                  Record Receipt ({formatINR(collectAmount)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
