import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { formatINR, formatDateIN } from '../utils/formatters';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { profile, filteredInvoices, filteredExpenses, summary, dateFilter } = useHospital();

  // Categorize revenues
  let opdConsultationIncome = 0;
  let otSurgeryIncome = 0;
  let anaesthesiaIncome = 0;
  let roomNursingIncome = 0;
  let medicinesConsumablesIncome = 0;
  let labInvestigationsIncome = 0;
  let otherProceduresIncome = 0;
  let totalDiscountsGiven = 0;

  filteredInvoices.forEach(inv => {
    totalDiscountsGiven += inv.discount;
    inv.items.forEach(it => {
      if (it.category === 'OPD Consultation') opdConsultationIncome += it.amount;
      else if (it.category === 'OT / Surgery') otSurgeryIncome += it.amount;
      else if (it.category === 'Anaesthesia') anaesthesiaIncome += it.amount;
      else if (it.category === 'Room Charges' || it.category === 'Nursing Care') roomNursingIncome += it.amount;
      else if (it.category === 'Medicines') medicinesConsumablesIncome += it.amount;
      else if (it.category === 'Investigations / Lab') labInvestigationsIncome += it.amount;
      else otherProceduresIncome += it.amount;
    });
  });

  const grossClinicalRevenue =
    opdConsultationIncome +
    otSurgeryIncome +
    anaesthesiaIncome +
    roomNursingIncome +
    medicinesConsumablesIncome +
    labInvestigationsIncome +
    otherProceduresIncome;

  const netClinicalRevenue = Math.max(0, grossClinicalRevenue - totalDiscountsGiven);

  // Categorize expenses
  const expenseBreakdown: { [cat: string]: number } = {};
  filteredExpenses.list.forEach(e => {
    expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;
  });

  const totalOperatingExpenses = filteredExpenses.total;
  const netSurplus = netClinicalRevenue - totalOperatingExpenses;

  // Export CSV handler
  const handleExportCSV = () => {
    const rows = [
      ['MANGAL MURTI HOSPITAL & RESEARCH CENTER'],
      [`Financial Report - Filter: ${dateFilter}`],
      ['Generated On', new Date().toLocaleString('en-IN')],
      [],
      ['REVENUE CATEGORY', 'AMOUNT (INR)'],
      ['OPD Consultations', opdConsultationIncome],
      ['OT Surgical Packages & Procedures', otSurgeryIncome],
      ['Anaesthesia Fees', anaesthesiaIncome],
      ['Room Rent & Nursing Care', roomNursingIncome],
      ['Medicines & Surgical Packs', medicinesConsumablesIncome],
      ['Investigations & Lab Diagnostics', labInvestigationsIncome],
      ['Other Procedures', otherProceduresIncome],
      ['Gross Clinical Revenue', grossClinicalRevenue],
      ['Less: Patient Concessions / Discounts', -totalDiscountsGiven],
      ['Net Clinical Inflow', netClinicalRevenue],
      [],
      ['OPERATING EXPENDITURES', 'AMOUNT (INR)'],
      ...Object.entries(expenseBreakdown).map(([k, v]) => [k, v]),
      ['Total Operating Expenditures', totalOperatingExpenses],
      [],
      ['NET OPERATING SURPLUS / (DEFICIT)', netSurplus],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `MangalMurti_Financial_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Financial Audit Statements & Profit / Loss Report
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Income & Expenditure (P&L)</span>
            <span aria-hidden="true">·</span>
            <span>Hospital Assets & Liabilities</span>
            <span aria-hidden="true">·</span>
            <span>Statutory Audit Export</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CA Excel / CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Audit Summary</span>
          </button>
        </div>
      </div>

      {/* Top Health Ratio Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">Net Operating Revenue</span>
          <span className="text-2xl font-bold text-teal-900 font-mono tabular-nums block mt-0.5">
            {formatINR(netClinicalRevenue)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">After {formatINR(totalDiscountsGiven)} concessions</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">Total Operating Outflows</span>
          <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums block mt-0.5">
            {formatINR(totalOperatingExpenses)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{filteredExpenses.list.length} Paid expense vouchers</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">Net Operating Surplus (EBITDA)</span>
          <span className={`text-2xl font-bold font-mono tabular-nums block mt-0.5 ${netSurplus >= 0 ? 'text-teal-800' : 'text-rose-600'}`}>
            {formatINR(netSurplus)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Operating Margin: {netClinicalRevenue > 0 ? ((netSurplus / netClinicalRevenue) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* Side-by-Side P&L Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income / Inflow Column */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-teal-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-800" />
              <h3 className="font-bold text-slate-900 text-sm">Operating Clinical Inflow</h3>
            </div>
            <span className="font-mono font-bold text-teal-900 text-xs">
              {formatINR(netClinicalRevenue)}
            </span>
          </div>

          <div className="p-5 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">1. OPD Consultation Charges</span>
              <span className="font-mono font-semibold text-slate-900">{formatINR(opdConsultationIncome)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">2. OT Surgical Packages & Surgeon Fees</span>
              <span className="font-mono font-semibold text-slate-900">{formatINR(otSurgeryIncome)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">3. Anaesthesia & Sedation Monitoring</span>
              <span className="font-mono font-semibold text-slate-900">{formatINR(anaesthesiaIncome)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">4. In-Patient Room Rent & Nursing Care</span>
              <span className="font-mono font-semibold text-slate-900">{formatINR(roomNursingIncome)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">5. Medicines, Consumables & Surgical Packs</span>
              <span className="font-mono font-semibold text-slate-900">{formatINR(medicinesConsumablesIncome)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">6. Pathology & Radiology Diagnostics</span>
              <span className="font-mono font-semibold text-slate-900">{formatINR(labInvestigationsIncome)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-700 font-medium">7. Casualty Triage & Minor Procedures</span>
              <span className="font-mono font-semibold text-slate-900">{formatINR(otherProceduresIncome)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-500 font-semibold pt-2">
              <span>Gross Clinical Earnings:</span>
              <span className="font-mono">{formatINR(grossClinicalRevenue)}</span>
            </div>

            {totalDiscountsGiven > 0 && (
              <div className="flex justify-between py-1.5 text-rose-600 font-medium">
                <span>Less: Concessions / Patient Rebates:</span>
                <span className="font-mono">- {formatINR(totalDiscountsGiven)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-t-2 border-teal-800 text-slate-900 font-bold text-sm">
              <span>Net Clinical Inflow Total:</span>
              <span className="font-mono text-teal-900">{formatINR(netClinicalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Expenditure / Outflow Column */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-rose-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">Hospital Operating Outflow</h3>
            </div>
            <span className="font-mono font-bold text-rose-600 text-xs">
              {formatINR(totalOperatingExpenses)}
            </span>
          </div>

          <div className="p-5 space-y-3 text-xs">
            {Object.keys(expenseBreakdown).length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                No expense vouchers recorded in this period.
              </div>
            ) : (
              Object.entries(expenseBreakdown).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">{cat}</span>
                  <span className="font-mono font-semibold text-rose-600 tabular-nums">{formatINR(amt)}</span>
                </div>
              ))
            )}

            <div className="flex justify-between py-2 border-t-2 border-rose-800 text-slate-900 font-bold text-sm mt-4">
              <span>Total Operating Expenses:</span>
              <span className="font-mono text-rose-600">{formatINR(totalOperatingExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheet Statement */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Balance Sheet Position</h3>
            <p className="text-xs text-slate-500">Liquid assets, equipment valuation, and current liabilities</p>
          </div>
          <span className="text-xs font-mono text-slate-400">As of {new Date().toLocaleDateString('en-IN')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Assets */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 uppercase tracking-tight block">
              Assets & Receivables
            </span>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>Cash-in-Hand (Liquid Vault):</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(summary.cashInHandEst)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>State Bank of India (Primary Bank):</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(summary.sbiBalanceEst)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>HDFC Current Account:</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(summary.hdfcBalanceEst)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Patient Balance Dues (Pending):</span>
                <span className="font-mono font-semibold text-amber-700">{formatINR(summary.uncollectedDues)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Medical Equipment & Infrastructure:</span>
                <span className="font-mono font-semibold text-slate-900">₹45,00,000</span>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
              <span>Total Hospital Assets:</span>
              <span className="font-mono text-teal-900">
                {formatINR(summary.cashInHandEst + summary.sbiBalanceEst + summary.hdfcBalanceEst + summary.uncollectedDues + 4500000)}
              </span>
            </div>
          </div>

          {/* Liabilities */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 uppercase tracking-tight block">
              Liabilities & Capital Reserve
            </span>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>Doctor Professional Fee Liability:</span>
                <span className="font-mono font-semibold text-rose-600">{formatINR(summary.doctorPendingShares)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Trade Payables (Medicine Distributors):</span>
                <span className="font-mono font-semibold text-slate-900">₹85,000</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Statutory TDS Payable (Sec 194J):</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(Math.round(summary.doctorPendingShares * 0.1))}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Hospital Capital & Reserve Fund:</span>
                <span className="font-mono font-semibold text-slate-900">₹51,00,000</span>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
              <span>Total Liabilities & Equity:</span>
              <span className="font-mono text-teal-900">
                {formatINR(summary.doctorPendingShares + 85000 + Math.round(summary.doctorPendingShares * 0.1) + 5100000)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
