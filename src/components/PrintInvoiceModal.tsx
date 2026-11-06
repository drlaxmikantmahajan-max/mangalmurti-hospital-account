import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { PatientInvoice } from '../types';
import { formatINR, formatDateIN, numberToWordsIndian } from '../utils/formatters';
import { X, Printer, Download, Share2, CheckCircle2 } from 'lucide-react';

interface PrintInvoiceModalProps {
  invoice: PatientInvoice | null;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ invoice, onClose }) => {
  const { profile } = useHospital();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-300 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-xs">Hospital Tax Invoice / Discharge Bill</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-teal-800 text-xs font-semibold">{invoice.invoiceNo}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill / Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Hospital Invoice Sheet */}
        <div id="printable-bill" className="p-8 sm:p-10 overflow-y-auto flex-1 font-sans text-slate-900 print:p-4 print:overflow-visible text-[12px]">
          {/* Hospital Header */}
          <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-teal-950 uppercase">
                  {profile.name}
                </h1>
              </div>
              <p className="text-xs font-bold text-teal-800 mt-0.5">
                {profile.marathiName}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {profile.tagline}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {profile.address}, {profile.city}, {profile.state} - {profile.pincode}
              </p>
              <p className="text-[11px] text-slate-500">
                Phone: {profile.phone} | Emergency: {profile.emergencyPhone} | Email: {profile.email}
              </p>
            </div>

            <div className="sm:text-right text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-900">Hospital Reg: {profile.hospitalRegNo}</p>
              <p className="font-mono">GSTIN: {profile.gstin}</p>
              <p className="font-mono">PAN: {profile.panNumber}</p>
              <p className="text-teal-800 font-semibold mt-1">
                Dir: {profile.directorName}
              </p>
              <p className="text-[10px] text-slate-500">{profile.directorQualification}</p>
            </div>
          </div>

          {/* Bill Title Banner */}
          <div className="my-3 py-1 bg-slate-100 text-center font-bold text-xs uppercase tracking-wider text-slate-800 border-y border-slate-200">
            {invoice.patientType === 'IPD' ? 'IN-PATIENT FINAL DISCHARGE BILL & TAX INVOICE' : 'OUT-PATIENT (OPD) BILL CUM RECEIPT'}
          </div>

          {/* Patient and Invoice Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200 text-xs">
            {/* Left Col */}
            <div className="space-y-1">
              <div>
                <span className="text-slate-500">Patient Name: </span>
                <span className="font-bold text-slate-900">{invoice.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500">Age / Gender: </span>
                <span className="font-medium">{invoice.age} Years / {invoice.gender}</span>
              </div>
              <div>
                <span className="text-slate-500">UHID / Patient ID: </span>
                <span className="font-mono font-bold text-teal-900">{invoice.uhid}</span>
              </div>
              <div>
                <span className="text-slate-500">Contact / Mobile: </span>
                <span className="font-mono">{invoice.mobile}</span>
              </div>
              {invoice.address && (
                <div>
                  <span className="text-slate-500">Address: </span>
                  <span>{invoice.address}</span>
                </div>
              )}
            </div>

            {/* Right Col */}
            <div className="space-y-1 sm:text-right">
              <div>
                <span className="text-slate-500">Invoice Number: </span>
                <span className="font-mono font-bold text-slate-900">{invoice.invoiceNo}</span>
              </div>
              <div>
                <span className="text-slate-500">Date & Time: </span>
                <span className="font-mono">{formatDateIN(invoice.date)} · {invoice.time}</span>
              </div>
              <div>
                <span className="text-slate-500">Attending Consultant: </span>
                <span className="font-bold text-teal-900">{invoice.primaryDoctorName}</span>
              </div>
              {invoice.wardBedNo && (
                <div>
                  <span className="text-slate-500">Ward / Bed No: </span>
                  <span className="font-semibold text-slate-800">{invoice.wardBedNo}</span>
                </div>
              )}
              {invoice.admissionDate && (
                <div>
                  <span className="text-slate-500">Admitted / Discharged: </span>
                  <span>{formatDateIN(invoice.admissionDate)} to {formatDateIN(invoice.dischargeDate || invoice.date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Insurance / TPA Reference if applicable */}
          {invoice.tpaDetails && (
            <div className="my-2 p-2 bg-amber-50/70 border border-amber-200 rounded text-xs flex justify-between">
              <div>
                <span className="text-amber-800 font-semibold">TPA / Cashless Insurance: </span>
                <span>{invoice.tpaDetails.provider}</span>
              </div>
              <div>
                <span className="text-amber-800 font-semibold">Claim ID: </span>
                <span className="font-mono">{invoice.tpaDetails.claimId}</span>
              </div>
            </div>
          )}

          {/* Itemized Table */}
          <div className="mt-4">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">Sr.</th>
                  <th className="py-2 px-3">Service Description</th>
                  <th className="py-2 px-3 w-32">Department</th>
                  <th className="py-2 px-3 w-16 text-center">Qty</th>
                  <th className="py-2 px-3 w-24 text-right">Rate (₹)</th>
                  <th className="py-2 px-3 w-28 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {it.description}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">{it.category}</td>
                    <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">{formatINR(it.rate)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                      {formatINR(it.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Amount Calculation Summary */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount in words and Hospital Bank details */}
            <div className="text-xs space-y-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">Total Amount in Words:</span>
                <span className="font-bold text-slate-900 leading-tight">
                  {numberToWordsIndian(invoice.grandTotal)}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">Hospital Bank Account for Online Payment:</span>
                <p>Bank: State Bank of India | A/C: <span className="font-mono font-semibold">{profile.sbiAccountNumber}</span></p>
                <p>IFSC: <span className="font-mono font-semibold">{profile.sbiIfsc}</span> | UPI ID: <span className="font-mono font-semibold">{profile.upiId}</span></p>
              </div>

              {invoice.notes && (
                <div className="text-[11px] text-slate-600 italic">
                  Note: {invoice.notes}
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Total Clinical Charges:</span>
                <span className="font-mono font-medium">{formatINR(invoice.subtotal)}</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>
                    Concession / Discount {invoice.discountReason ? `(${invoice.discountReason})` : ''}:
                  </span>
                  <span className="font-mono font-medium">- {formatINR(invoice.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>GST / Taxes (0% on Health Services):</span>
                <span className="font-mono font-medium">₹0</span>
              </div>

              <div className="flex justify-between text-slate-900 font-bold text-sm pt-1.5 border-t border-slate-300">
                <span>Net Payable (Grand Total):</span>
                <span className="font-mono text-teal-900">{formatINR(invoice.grandTotal)}</span>
              </div>

              <div className="flex justify-between text-emerald-800 font-semibold pt-1">
                <span>Amount Received ({invoice.paymentMode}):</span>
                <span className="font-mono">{formatINR(invoice.amountPaid)}</span>
              </div>

              <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                <span>Balance Dues:</span>
                <span className={`font-mono ${invoice.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {formatINR(invoice.balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Hospital Stamp Block */}
          <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="flex flex-col items-center justify-end">
              <div className="h-10 border-b border-dashed border-slate-400 w-44" />
              <span className="font-bold text-slate-800 mt-1">Authorized Cashier / Accounts</span>
              <span className="text-[10px] text-slate-500">Mangal Murti Hospital</span>
            </div>

            <div className="flex flex-col items-center justify-end">
              <div className="text-[11px] text-teal-900 font-bold mb-1">
                {profile.directorName}
              </div>
              <div className="h-7 border-b border-dashed border-slate-400 w-48" />
              <span className="font-bold text-slate-800 mt-1">Chief Medical Officer / Treating Doctor</span>
              <span className="text-[10px] text-slate-500">Reg No: {profile.directorRegNo}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
            This is a computer-generated official billing document issued by Mangal Murti Hospital & Research Center. For billing queries, call {profile.phone}.
          </div>
        </div>
      </div>
    </div>
  );
};
