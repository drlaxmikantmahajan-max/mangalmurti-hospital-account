export type PatientType = 'OPD' | 'IPD' | 'DayCare' | 'Emergency';

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'TPA / Insurance' | 'Multiple';

export type InvoiceCategory = 
  | 'OPD Consultation'
  | 'Room Charges'
  | 'OT / Surgery'
  | 'Anaesthesia'
  | 'Nursing Care'
  | 'Medicines'
  | 'Investigations / Lab'
  | 'Procedures'
  | 'Equipment / Oxygen'
  | 'Miscellaneous';

export interface InvoiceItem {
  id: string;
  category: InvoiceCategory;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  doctorId?: string;
}

export interface DoctorShareEntry {
  doctorId: string;
  doctorName: string;
  role: 'Surgeon' | 'Consultant' | 'Anaesthetist' | 'Assistant';
  sharePercent: number;
  shareAmount: number;
  isSettled: boolean;
  settlementId?: string;
}

export interface PatientInvoice {
  id: string;
  invoiceNo: string;
  uhid: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  address?: string;
  patientType: PatientType;
  admissionDate?: string;
  dischargeDate?: string;
  wardBedNo?: string;
  primaryDoctorId: string;
  primaryDoctorName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountReason?: string;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  paymentRef?: string;
  paymentSplits?: {
    mode: PaymentMode;
    amount: number;
    reference?: string;
  }[];
  tpaDetails?: {
    provider: string;
    policyNo?: string;
    claimId: string;
    preAuthAmount: number;
    approvalStatus: 'Approved' | 'Pending' | 'Query' | 'Settled';
  };
  doctorShares: DoctorShareEntry[];
  hospitalShareAmount: number;
  date: string;
  time: string;
  notes?: string;
  status: 'Paid' | 'Partial' | 'Due' | 'Cancelled';
  counter: string;
  billedBy: string;
}

export interface Doctor {
  id: string;
  name: string;
  marathiName?: string;
  qualification: string;
  specialization: string;
  mobile: string;
  email?: string;
  opdSharePercent: number;
  surgerySharePercent: number;
  panNumber: string;
  bankAccount: string;
  ifscCode: string;
}

export type ExpenseCategory =
  | 'Medical Supplies & Implants'
  | 'Pharmacy Distributor'
  | 'Oxygen & Biomedical Gas'
  | 'Doctor Share Payout'
  | 'Staff & Nurse Salaries'
  | 'Hospital Electricity & Diesel'
  | 'Biomedical Waste & Infection Control'
  | 'Equipment AMC & Repairs'
  | 'Housekeeping & Canteen'
  | 'Administrative & Printing'
  | 'Taxes & Statutory Fees';

export interface Expense {
  id: string;
  voucherNo: string;
  date: string;
  category: ExpenseCategory;
  payeeName: string;
  description: string;
  amount: number;
  paymentMode: 'Cash' | 'Bank Transfer (SBI)' | 'Bank Transfer (HDFC)' | 'Cheque' | 'UPI';
  refNumber?: string;
  approvedBy: string;
  notes?: string;
}

export interface DoctorSettlement {
  id: string;
  settlementNo: string;
  doctorId: string;
  doctorName: string;
  date: string;
  periodDescription: string;
  grossAmount: number;
  tdsPercent: number; // e.g. 10%
  tdsAmount: number;
  netPayable: number;
  paymentMode: 'Bank Transfer (SBI)' | 'Bank Transfer (HDFC)' | 'Cheque' | 'Cash';
  bankRef: string;
  invoiceIds: string[];
  status: 'Paid' | 'Draft';
  remarks?: string;
}

export interface CashbookEntry {
  id: string;
  voucherNo: string;
  date: string;
  time: string;
  type: 'Receipt' | 'Payment' | 'Contra';
  account: 'Cash-in-Hand' | 'SBI Main Account' | 'HDFC Current Account';
  counter: string;
  narration: string;
  amount: number;
  relatedId?: string; // invoice or expense ID
}

export interface ShiftCloseRecord {
  id: string;
  date: string;
  shift: 'Morning (8AM - 2PM)' | 'Evening (2PM - 8PM)' | 'Night (8PM - 8AM)';
  cashierName: string;
  openingCash: number;
  totalCashReceipts: number;
  totalCashExpenses: number;
  expectedCash: number;
  denominations: {
    note500: number;
    note200: number;
    note100: number;
    note50: number;
    note20: number;
    note10: number;
    coins: number;
  };
  physicalCashCounted: number;
  difference: number;
  closingRemarks: string;
  timestamp: string;
}

export interface HospitalProfile {
  name: string;
  tagline: string;
  marathiName: string;
  directorName: string;
  directorQualification: string;
  directorRegNo: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  hospitalRegNo: string;
  gstin: string;
  panNumber: string;
  sbiAccountNumber: string;
  sbiIfsc: string;
  hdfcAccountNumber: string;
  hdfcIfsc: string;
  upiId: string;
}
