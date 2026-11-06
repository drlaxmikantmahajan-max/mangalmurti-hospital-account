import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { 
  PatientType, 
  PaymentMode, 
  InvoiceItem, 
  InvoiceCategory, 
  DoctorShareEntry,
  PatientInvoice 
} from '../types';
import { formatINR } from '../utils/formatters';
import { X, Plus, Trash2, Sparkles, Building2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (inv: PatientInvoice) => void;
}

const PRESET_SERVICES: { label: string; category: InvoiceCategory; rate: number; defaultDoctorRole?: string }[] = [
  { label: 'OPD Surgical Consultation', category: 'OPD Consultation', rate: 500, defaultDoctorRole: 'Consultant' },
  { label: 'OPD Gynae / ANC Checkup', category: 'OPD Consultation', rate: 600, defaultDoctorRole: 'Consultant' },
  { label: 'Emergency / Casualty Triage & Dressing', category: 'Procedures', rate: 1500 },
  { label: 'Laparoscopic Cholecystectomy Package', category: 'OT / Surgery', rate: 35000, defaultDoctorRole: 'Surgeon' },
  { label: 'Laparoscopic Appendicectomy Package', category: 'OT / Surgery', rate: 28000, defaultDoctorRole: 'Surgeon' },
  { label: 'Inguinal Hernia Mesh Repair', category: 'OT / Surgery', rate: 25000, defaultDoctorRole: 'Surgeon' },
  { label: 'Normal Vaginal Delivery (NVD)', category: 'OT / Surgery', rate: 22000, defaultDoctorRole: 'Surgeon' },
  { label: 'LSCS Caesarean Section Delivery', category: 'OT / Surgery', rate: 32000, defaultDoctorRole: 'Surgeon' },
  { label: 'Orthopaedic Fracture Fixation (ORIF)', category: 'OT / Surgery', rate: 40000, defaultDoctorRole: 'Surgeon' },
  { label: 'General Anaesthesia & Monitoring', category: 'Anaesthesia', rate: 6500, defaultDoctorRole: 'Anaesthetist' },
  { label: 'Spinal / Epidural Anaesthesia', category: 'Anaesthesia', rate: 5500, defaultDoctorRole: 'Anaesthetist' },
  { label: 'General Ward Bed (Per Day)', category: 'Room Charges', rate: 900 },
  { label: 'Semi-Special Room (Per Day)', category: 'Room Charges', rate: 1800 },
  { label: 'Deluxe Special Room (Per Day)', category: 'Room Charges', rate: 2500 },
  { label: 'ICU Bed with Multipara Monitor (Per Day)', category: 'Room Charges', rate: 4500 },
  { label: 'Nursing Care & RMO Charges', category: 'Nursing Care', rate: 800 },
  { label: 'USG Abdomen & Pelvis Screening', category: 'Investigations / Lab', rate: 1200 },
  { label: 'Pre-Op Routine Lab Panel (CBC, LFT, RFT, Sugar)', category: 'Investigations / Lab', rate: 1800 },
  { label: 'OT Sterile Disposable & Surgical Pack', category: 'Medicines', rate: 3500 },
];

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { doctors, addInvoice, profile } = useHospital();

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [patientType, setPatientType] = useState<PatientType>('OPD');
  const [wardBedNo, setWardBedNo] = useState('');
  const [admissionDate, setAdmissionDate] = useState('2026-10-30');
  const [dischargeDate, setDischargeDate] = useState('2026-11-01');
  const [primaryDoctorId, setPrimaryDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [counter, setCounter] = useState('OPD Counter 1');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'it-1',
      category: 'OPD Consultation',
      description: 'Consultation & Clinical Evaluation',
      quantity: 1,
      rate: 500,
      amount: 500,
      doctorId: doctors[0]?.id || 'doc-1',
    },
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(500);
  const [notes, setNotes] = useState<string>('');

  // TPA Details
  const [tpaProvider, setTpaProvider] = useState<string>('Star Health');
  const [tpaClaimId, setTpaClaimId] = useState<string>('');

  if (!isOpen) return null;

  const handlePatientTypeChange = (type: PatientType) => {
    setPatientType(type);
    if (type === 'OPD') {
      setCounter('OPD Counter 1');
      setItems([
        {
          id: `it-${Date.now()}`,
          category: 'OPD Consultation',
          description: 'OPD Consultation & Clinical Evaluation',
          quantity: 1,
          rate: 500,
          amount: 500,
          doctorId: primaryDoctorId,
        },
      ]);
      setAmountPaid(500);
    } else if (type === 'IPD') {
      setCounter('IPD Main Accounts');
      setItems([
        {
          id: `it-1`,
          category: 'OT / Surgery',
          description: 'Surgical Procedure / Operation Charges',
          quantity: 1,
          rate: 30000,
          amount: 30000,
          doctorId: primaryDoctorId,
        },
        {
          id: `it-2`,
          category: 'Anaesthesia',
          description: 'Anaesthesia & Intraoperative Monitoring',
          quantity: 1,
          rate: 6000,
          amount: 6000,
          doctorId: 'doc-4', // Dr. Priya Deshmukh
        },
        {
          id: `it-3`,
          category: 'Room Charges',
          description: 'Hospital Room & Bed Charges (2 Days)',
          quantity: 2,
          rate: 1800,
          amount: 3600,
        },
      ]);
      setAmountPaid(39600);
    }
  };

  const handleAddItem = (category: InvoiceCategory = 'Miscellaneous', desc = '', rate = 0) => {
    const newItem: InvoiceItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      category,
      description: desc,
      quantity: 1,
      rate,
      amount: rate,
      doctorId: category === 'OT / Surgery' || category === 'OPD Consultation' ? primaryDoctorId : undefined,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it;
        const updated = { ...it, ...updates };
        updated.amount = (updated.quantity || 1) * (updated.rate || 0);
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(it => it.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = Math.max(0, subtotal - (discount || 0));
  const balanceDue = Math.max(0, grandTotal - (amountPaid || 0));

  const handleQuickPreset = (preset: typeof PRESET_SERVICES[0]) => {
    const defaultDoc = preset.category === 'Anaesthesia' 
      ? 'doc-4' 
      : (preset.category === 'OT / Surgery' || preset.category === 'OPD Consultation') 
      ? primaryDoctorId 
      : undefined;

    const newItem: InvoiceItem = {
      id: `it-${Date.now()}`,
      category: preset.category,
      description: preset.label,
      quantity: 1,
      rate: preset.rate,
      amount: preset.rate,
      doctorId: defaultDoc,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }

    const primaryDoc = doctors.find(d => d.id === primaryDoctorId) || doctors[0];

    // Compute doctor shares
    const doctorShareMap: { [docId: string]: { docName: string; role: any; percent: number; amount: number } } = {};

    items.forEach(item => {
      if (item.doctorId) {
        const doc = doctors.find(d => d.id === item.doctorId);
        if (doc) {
          const isAnaesthesia = item.category === 'Anaesthesia';
          const isOpd = item.category === 'OPD Consultation';
          const role = isAnaesthesia ? 'Anaesthetist' : isOpd ? 'Consultant' : 'Surgeon';
          const percent = isAnaesthesia ? 100 : isOpd ? doc.opdSharePercent : doc.surgerySharePercent;
          const share = Math.round((item.amount * percent) / 100);

          if (!doctorShareMap[doc.id]) {
            doctorShareMap[doc.id] = {
              docName: doc.name,
              role,
              percent,
              amount: 0,
            };
          }
          doctorShareMap[doc.id].amount += share;
        }
      }
    });

    const doctorShares: DoctorShareEntry[] = Object.entries(doctorShareMap).map(([dId, data]) => ({
      doctorId: dId,
      doctorName: data.docName,
      role: data.role,
      sharePercent: data.percent,
      shareAmount: data.amount,
      isSettled: false,
    }));

    const totalDoctorShare = doctorShares.reduce((s, d) => s + d.shareAmount, 0);
    const hospitalShareAmount = Math.max(0, grandTotal - totalDoctorShare);

    const status = balanceDue === 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Due';

    const newInv = addInvoice({
      patientName: patientName.trim(),
      age: Number(age),
      gender,
      mobile: mobile.trim() || 'Not Provided',
      address: address.trim(),
      patientType,
      admissionDate: patientType !== 'OPD' ? admissionDate : undefined,
      dischargeDate: patientType !== 'OPD' ? dischargeDate : undefined,
      wardBedNo: patientType !== 'OPD' ? wardBedNo : undefined,
      primaryDoctorId: primaryDoc.id,
      primaryDoctorName: primaryDoc.name,
      items,
      subtotal,
      discount: Number(discount) || 0,
      discountReason: discountReason.trim() || undefined,
      taxPercent: 0,
      taxAmount: 0,
      grandTotal,
      amountPaid: Number(amountPaid) || 0,
      balanceDue,
      paymentMode,
      paymentRef: paymentRef.trim() || undefined,
      tpaDetails: paymentMode === 'TPA / Insurance' ? {
        provider: tpaProvider,
        claimId: tpaClaimId || `CLM-${Date.now().toString().slice(-6)}`,
        preAuthAmount: Number(amountPaid) || 0,
        approvalStatus: 'Approved',
      } : undefined,
      doctorShares,
      hospitalShareAmount,
      notes: notes.trim() || undefined,
      status,
      counter,
      billedBy: `${profile.directorName} Clinic Office`,
    });

    onCreated(newInv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-200 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">New Bill Generator</span>
              <span aria-hidden="true">·</span>
              <span className="text-xs text-slate-500 font-medium">{profile.name}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Create Patient Invoice & Ledger Entry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Patient Classification & Demographics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs tracking-tight uppercase">
                1. Patient Category & Personal Data
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['OPD', 'IPD', 'DayCare', 'Emergency'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePatientTypeChange(type)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      patientType === type
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Chavan"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Age & Gender *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={age}
                    onChange={e => setAge(parseInt(e.target.value) || 0)}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-mono"
                  />
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Mobile Contact</label>
                <input
                  type="text"
                  placeholder="10-digit mobile"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Attending Consultant *</label>
                <select
                  value={primaryDoctorId}
                  onChange={e => setPrimaryDoctorId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {patientType !== 'OPD' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-teal-50/50 border border-teal-100 rounded-lg mt-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ward / Room / Bed No</label>
                  <input
                    type="text"
                    placeholder="e.g. Deluxe Room 102 or ICU Bed 4"
                    value={wardBedNo}
                    onChange={e => setWardBedNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Date of Admission</label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={e => setAdmissionDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Date of Discharge / Expected</label>
                  <input
                    type="date"
                    value={dischargeDate}
                    onChange={e => setDischargeDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Services */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 text-xs tracking-tight uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-800" />
                Quick Catalog Presets
              </span>
              <span className="text-[11px] text-slate-400">Click to append line item</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-lg">
              {PRESET_SERVICES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPreset(p)}
                  className="px-2 py-1 text-[11px] font-medium bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
                >
                  + {p.label} <span className="font-mono text-slate-400">({formatINR(p.rate)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs tracking-tight uppercase">
                2. Itemized Clinical & Hospital Charges
              </span>
              <button
                type="button"
                onClick={() => handleAddItem('Miscellaneous', '', 500)}
                className="flex items-center gap-1 text-teal-800 font-semibold hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Charge
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 w-32">Category</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 w-40">Allotted Doctor</th>
                    <th className="py-2 px-3 w-16 text-center">Qty</th>
                    <th className="py-2 px-3 w-24 text-right">Rate (₹)</th>
                    <th className="py-2 px-3 w-28 text-right">Amount (₹)</th>
                    <th className="py-2 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <select
                          value={item.category}
                          onChange={e => handleUpdateItem(item.id, { category: e.target.value as InvoiceCategory })}
                          className="w-full p-1 bg-white border border-slate-200 rounded text-[11px]"
                        >
                          <option value="OPD Consultation">OPD Consultation</option>
                          <option value="OT / Surgery">OT / Surgery</option>
                          <option value="Anaesthesia">Anaesthesia</option>
                          <option value="Room Charges">Room Charges</option>
                          <option value="Nursing Care">Nursing Care</option>
                          <option value="Medicines">Medicines</option>
                          <option value="Investigations / Lab">Investigations</option>
                          <option value="Procedures">Procedures</option>
                          <option value="Equipment / Oxygen">Equipment / Oxygen</option>
                          <option value="Miscellaneous">Miscellaneous</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={e => handleUpdateItem(item.id, { description: e.target.value })}
                          placeholder="Service description..."
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.doctorId || ''}
                          onChange={e => handleUpdateItem(item.id, { doctorId: e.target.value || undefined })}
                          className="w-full p-1 bg-white border border-slate-200 rounded text-[11px]"
                        >
                          <option value="">(Hospital Pool)</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => handleUpdateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-full p-1 text-center font-mono bg-white border border-slate-200 rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          value={item.rate}
                          onChange={e => handleUpdateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                          className="w-full p-1 text-right font-mono bg-white border border-slate-200 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-800 tabular-nums">
                        {formatINR(item.amount)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing Settlement, Discounts & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-200">
            {/* Left: Payment Method & Reference */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-tight block">
                Payment Collection Details
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Mode *</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="Cash">Cash (Counter Safe)</option>
                    <option value="UPI">UPI / QR (GPay / PhonePe)</option>
                    <option value="Card">Card (POS Terminal)</option>
                    <option value="Bank Transfer">Bank Transfer (SBI / HDFC)</option>
                    <option value="TPA / Insurance">TPA / Cashless Insurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Billing Counter</label>
                  <select
                    value={counter}
                    onChange={e => setCounter(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="OPD Counter 1">OPD Counter 1</option>
                    <option value="IPD Main Accounts">IPD Main Accounts</option>
                    <option value="Emergency Counter">Emergency / Night Counter</option>
                  </select>
                </div>
              </div>

              {paymentMode === 'TPA / Insurance' && (
                <div className="grid grid-cols-2 gap-2 p-2 bg-amber-50/60 border border-amber-200 rounded">
                  <div>
                    <label className="block text-amber-900 font-medium mb-0.5">TPA Provider</label>
                    <input
                      type="text"
                      placeholder="e.g. Star Health, PMJAY, MediAssist"
                      value={tpaProvider}
                      onChange={e => setTpaProvider(e.target.value)}
                      className="w-full p-1 bg-white border border-amber-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-900 font-medium mb-0.5">Pre-Auth / Claim ID</label>
                    <input
                      type="text"
                      placeholder="Claim ref #"
                      value={tpaClaimId}
                      onChange={e => setTpaClaimId(e.target.value)}
                      className="w-full p-1 bg-white border border-amber-300 rounded font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-medium mb-1">Transaction Ref / Cheque No / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / GPay TXN / Patient Memo"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Clinical Remarks / Discharge Advice</label>
                <textarea
                  rows={2}
                  placeholder="Diagnosis, follow-up, or billing instructions..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Right: Totals, Discounts, and Due calculation */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal (Clinical Items):</span>
                <span className="font-mono font-semibold text-slate-900 text-sm">{formatINR(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-700 font-medium">Hospital Concession / Discount (₹):</span>
                  <input
                    type="text"
                    placeholder="Discount Reason (e.g. Staff / Senior)"
                    value={discountReason}
                    onChange={e => setDiscountReason(e.target.value)}
                    className="block text-[11px] p-1 bg-white border border-slate-200 rounded mt-0.5 w-48"
                  />
                </div>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                />
              </div>

              <div className="flex justify-between items-center text-slate-900 font-bold text-sm pt-2 border-t border-slate-300">
                <span>Net Payable (Grand Total):</span>
                <span className="font-mono text-base text-teal-900">{formatINR(grandTotal)}</span>
              </div>

              <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-200">
                <span className="text-slate-800 font-semibold">Amount Received Now (₹):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAmountPaid(grandTotal)}
                    className="text-[10px] text-teal-800 hover:underline font-semibold"
                  >
                    Full (100%)
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={grandTotal}
                    value={amountPaid}
                    onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-28 p-1.5 bg-white border border-teal-600 rounded-lg text-right font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-medium">Balance Dues:</span>
                <span className={`font-mono font-bold text-sm ${balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatINR(balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-[11px] text-slate-400">
              Generated under supervision of {profile.directorName}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Save & Open Invoice
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
