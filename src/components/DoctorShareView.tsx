import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Doctor, DoctorSettlement, PaymentMode } from '../types';
import { formatINR, formatDateIN } from '../utils/formatters';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  Plus, 
  Receipt, 
  ShieldCheck, 
  User, 
  X,
  Printer
} from 'lucide-react';

export const DoctorShareView: React.FC = () => {
  const { doctors, invoices, doctorSettlements, createDoctorSettlement, profile } = useHospital();

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(doctors[0]);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [viewSettlement, setViewSettlement] = useState<DoctorSettlement | null>(null);

  // Settlement Form state
  const [tdsPercent, setTdsPercent] = useState<number>(10); // Standard 10% under Sec 194J
  const [periodDesc, setPeriodDesc] = useState<string>('October 2026 Surgeries & OPD Batch');
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer (SBI)' | 'Bank Transfer (HDFC)' | 'Cheque' | 'Cash'>('Bank Transfer (SBI)');
  const [bankRef, setBankRef] = useState<string>(`NEFT/SBI/${Date.now().toString().slice(-8)}`);
  const [remarks, setRemarks] = useState<string>('Professional consultancy fees after statutory 10% TDS deduction.');

  // Compute doctor's performance & earnings across all invoices
  const docStats = doctors.map(doc => {
    let grossEarned = 0;
    let settledAmount = 0;
    let pendingAmount = 0;
    const pendingInvoiceIds: string[] = [];
    let casesCount = 0;

    invoices.forEach(inv => {
      inv.doctorShares?.forEach(ds => {
        if (ds.doctorId === doc.id) {
          grossEarned += ds.shareAmount;
          casesCount++;
          if (ds.isSettled) {
            settledAmount += ds.shareAmount;
          } else {
            pendingAmount += ds.shareAmount;
            if (!pendingInvoiceIds.includes(inv.id)) {
              pendingInvoiceIds.push(inv.id);
            }
          }
        }
      });
    });

    return {
      doc,
      grossEarned,
      settledAmount,
      pendingAmount,
      pendingInvoiceIds,
      casesCount,
    };
  });

  const activeDocStat = docStats.find(s => s.doc.id === selectedDoctor.id) || docStats[0];

  const handleOpenSettlement = () => {
    if (activeDocStat.pendingAmount <= 0) {
      alert(`Dr. ${selectedDoctor.name} has no pending shares to settle at this time.`);
      return;
    }
    setSettlementModalOpen(true);
  };

  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = activeDocStat.pendingAmount;
    const tds = Math.round((gross * tdsPercent) / 100);
    const net = gross - tds;

    createDoctorSettlement({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: new Date().toISOString().split('T')[0],
      periodDescription: periodDesc,
      grossAmount: gross,
      tdsPercent,
      tdsAmount: tds,
      netPayable: net,
      paymentMode,
      bankRef,
      invoiceIds: activeDocStat.pendingInvoiceIds,
      status: 'Paid',
      remarks,
    });

    setSettlementModalOpen(false);
  };

  // Get settled history for current doctor
  const docSettlementHistory = doctorSettlements.filter(s => s.doctorId === selectedDoctor.id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Doctor Consultancy & Surgery Share Ledger
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Consultancy Fee Sharing</span>
            <span aria-hidden="true">·</span>
            <span>Surgeon / OT Procedures</span>
            <span aria-hidden="true">·</span>
            <span>TDS Compliance (Sec 194J)</span>
          </div>
        </div>

        <button
          onClick={handleOpenSettlement}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Disburse Payout for {selectedDoctor.name.split(' ')[1]}</span>
        </button>
      </div>

      {/* Doctor Selector Pills / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {docStats.map(({ doc, grossEarned, pendingAmount, casesCount }) => {
          const isSelected = selectedDoctor.id === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => setSelectedDoctor(doc)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-900 text-white border-teal-900 shadow-sm'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                  {doc.specialization.split(' ')[0]}
                </span>
                {pendingAmount > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-teal-800 text-amber-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    {formatINR(pendingAmount)}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-xs mt-1 truncate">{doc.name}</h4>
              <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                {doc.qualification}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100/20 flex justify-between items-center text-[11px]">
                <span className={isSelected ? 'text-teal-200' : 'text-slate-400'}>{casesCount} cases</span>
                <span className="font-mono font-semibold">{formatINR(grossEarned)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Doctor Summary Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-teal-800 font-bold text-base border border-slate-200">
              {selectedDoctor.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{selectedDoctor.name}</h3>
                {selectedDoctor.marathiName && (
                  <span className="text-xs text-slate-500">{selectedDoctor.marathiName}</span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">{selectedDoctor.qualification} — {selectedDoctor.specialization}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>PAN: <span className="font-mono text-slate-700">{selectedDoctor.panNumber}</span></span>
                <span aria-hidden="true">·</span>
                <span>Bank A/C: <span className="font-mono text-slate-700">{selectedDoctor.bankAccount}</span></span>
                <span aria-hidden="true">·</span>
                <span>OPD Share: {selectedDoctor.opdSharePercent}%</span>
                <span aria-hidden="true">·</span>
                <span>Surgery Share: {selectedDoctor.surgerySharePercent}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-medium block uppercase">Pending Payout Liability</span>
              <span className="text-xl font-bold text-amber-700 font-mono tabular-nums">
                {formatINR(activeDocStat.pendingAmount)}
              </span>
            </div>
            <button
              onClick={handleOpenSettlement}
              disabled={activeDocStat.pendingAmount <= 0}
              className={`px-3 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer ${
                activeDocStat.pendingAmount > 0
                  ? 'bg-teal-800 hover:bg-teal-900 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Generate Settlement Voucher
            </button>
          </div>
        </div>

        {/* 3 Metric Mini Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-400 font-medium block">Total Professional Fees Earned</span>
            <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
              {formatINR(activeDocStat.grossEarned)}
            </span>
            <span className="text-[10px] text-slate-500">{activeDocStat.casesCount} Total Bill Allocations</span>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <span className="text-[11px] text-slate-400 font-medium block">Disbursed & Settled to Bank</span>
            <span className="text-base font-bold text-emerald-800 font-mono mt-0.5 block">
              {formatINR(activeDocStat.settledAmount)}
            </span>
            <span className="text-[10px] text-emerald-700">{docSettlementHistory.length} Vouchers Issued</span>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
            <span className="text-[11px] text-slate-400 font-medium block">Net Payable After 10% TDS</span>
            <span className="text-base font-bold text-amber-800 font-mono mt-0.5 block">
              {formatINR(Math.round(activeDocStat.pendingAmount * 0.9))}
            </span>
            <span className="text-[10px] text-amber-700">TDS: {formatINR(Math.round(activeDocStat.pendingAmount * 0.1))}</span>
          </div>
        </div>
      </div>

      {/* Settlement History & Unsettled Line Items Tabulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unsettled Invoices Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Unsettled Case Allocations</h4>
              <span className="text-[11px] text-slate-500">Awaiting disbursement for {selectedDoctor.name}</span>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-700">
              {formatINR(activeDocStat.pendingAmount)}
            </span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Patient / Case</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3 text-right">Share %</th>
                  <th className="py-2 px-3 text-right">Fee (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices
                  .flatMap(inv =>
                    (inv.doctorShares || [])
                      .filter(ds => ds.doctorId === selectedDoctor.id && !ds.isSettled)
                      .map(ds => ({ ...ds, inv }))
                  )
                  .map(({ inv, role, sharePercent, shareAmount }, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{formatDateIN(inv.date)}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block">{inv.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{inv.invoiceNo} · {inv.patientType}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{role}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">{sharePercent}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatINR(shareAmount)}
                      </td>
                    </tr>
                  ))}
                {activeDocStat.pendingAmount === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      All doctor shares have been reconciled and settled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Past Settlement Vouchers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Disbursed Settlement Records</h4>
              <span className="text-[11px] text-slate-500">Bank payouts with 194J TDS certificates</span>
            </div>
            <span className="text-xs text-slate-400">{docSettlementHistory.length} Settled</span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="py-2 px-3">Voucher # & Date</th>
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3 text-right">Gross</th>
                  <th className="py-2 px-3 text-right">TDS (10%)</th>
                  <th className="py-2 px-3 text-right">Net Paid</th>
                  <th className="py-2 px-2 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docSettlementHistory.map((set) => (
                  <tr key={set.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-semibold text-slate-900 block">{set.settlementNo}</span>
                      <span className="text-[10px] text-slate-400">{formatDateIN(set.date)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[140px] truncate" title={set.periodDescription}>
                      {set.periodDescription}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatINR(set.grossAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600">-{formatINR(set.tdsAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                      {formatINR(set.netPayable)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => setViewSettlement(set)}
                        className="p-1 rounded text-teal-800 hover:bg-teal-50 cursor-pointer"
                        title="View Certificate"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {docSettlementHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No past settlement records found for this consultant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Doctor Payout Settlement Modal */}
      {settlementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Disbursement Authorization</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Settle Fees for {selectedDoctor.name}
                </h3>
              </div>
              <button
                onClick={() => setSettlementModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettlement} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Share Accrued ({activeDocStat.pendingInvoiceIds.length} cases):</span>
                  <span className="font-mono font-bold text-slate-900">{formatINR(activeDocStat.pendingAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>Less TDS under Sec 194J ({tdsPercent}%):</span>
                  <span className="font-mono font-medium">
                    - {formatINR(Math.round((activeDocStat.pendingAmount * tdsPercent) / 100))}
                  </span>
                </div>
                <div className="flex justify-between text-teal-900 font-bold text-sm border-t border-slate-200 pt-1.5">
                  <span>Net Disbursable Amount:</span>
                  <span className="font-mono text-base">
                    {formatINR(activeDocStat.pendingAmount - Math.round((activeDocStat.pendingAmount * tdsPercent) / 100))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">TDS Rate (% under 194J)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={tdsPercent}
                    onChange={e => setTdsPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Disbursement Channel *</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="Bank Transfer (SBI)">State Bank of India (Direct NEFT)</option>
                    <option value="Bank Transfer (HDFC)">HDFC Bank Account</option>
                    <option value="Cheque">Hospital Cheque</option>
                    <option value="Cash">Cash Counter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Period Description / Settlement Batch</label>
                <input
                  type="text"
                  required
                  value={periodDesc}
                  onChange={e => setPeriodDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Bank Reference / UTR / Cheque No *</label>
                <input
                  type="text"
                  required
                  value={bankRef}
                  onChange={e => setBankRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Accounting Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-2.5 bg-teal-50 border border-teal-100 rounded text-[11px] text-teal-900">
                Note: Upon confirmation, this amount will automatically register as an authorized hospital outflow expense and mark all {activeDocStat.pendingInvoiceIds.length} invoice shares as settled.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettlementModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm Payout ({formatINR(activeDocStat.pendingAmount - Math.round((activeDocStat.pendingAmount * tdsPercent) / 100))})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Settlement Voucher Modal */}
      {viewSettlement && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-300 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{profile.name}</h3>
                <p className="text-[11px] text-teal-800 font-semibold">{profile.marathiName}</p>
                <p className="text-[10px] text-slate-500">Doctor Share Settlement Certificate & 194J Advice</p>
              </div>
              <button
                onClick={() => setViewSettlement(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block">Voucher No:</span>
                <span className="font-mono font-bold text-slate-800">{viewSettlement.settlementNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Disbursement Date:</span>
                <span className="font-mono">{formatDateIN(viewSettlement.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Doctor / Consultant:</span>
                <span className="font-bold text-slate-900">{viewSettlement.doctorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Mode:</span>
                <span>{viewSettlement.paymentMode}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Bank / UTR Reference:</span>
                <span className="font-mono text-teal-900 font-semibold">{viewSettlement.bankRef}</span>
              </div>
            </div>

            <div className="space-y-1.5 border border-slate-200 rounded p-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Professional Share:</span>
                <span className="font-mono font-semibold">{formatINR(viewSettlement.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Less TDS ({viewSettlement.tdsPercent}% under Sec 194J):</span>
                <span className="font-mono font-semibold">- {formatINR(viewSettlement.tdsAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Net Credited to Account:</span>
                <span className="font-mono text-emerald-800">{formatINR(viewSettlement.netPayable)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic">
              Period: {viewSettlement.periodDescription}. {viewSettlement.remarks}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px]">
              <div>
                <span className="text-slate-400 block">Authorized Signature:</span>
                <span className="font-bold text-slate-900 mt-2 block">{profile.directorName}</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
