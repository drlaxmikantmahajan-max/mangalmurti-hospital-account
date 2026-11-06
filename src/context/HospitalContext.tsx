import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  HospitalProfile,
  Doctor,
  PatientInvoice,
  Expense,
  DoctorSettlement,
  CashbookEntry,
  ShiftCloseRecord,
  PaymentMode,
} from '../types';
import {
  initialHospitalProfile,
  initialDoctors,
  initialInvoices,
  initialExpenses,
  initialDoctorSettlements,
  initialCashbook,
  initialShiftRecords,
} from '../data/initialData';

const STORAGE_KEY = 'mmh_accounts_v1';

export type DateFilterType = 'today' | 'yesterday' | '7days' | 'month' | 'fy' | 'all' | 'custom';

interface HospitalContextType {
  profile: HospitalProfile;
  updateProfile: (updated: HospitalProfile) => void;
  doctors: Doctor[];
  addDoctor: (doc: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, doc: Partial<Doctor>) => void;
  invoices: PatientInvoice[];
  addInvoice: (inv: Omit<PatientInvoice, 'id' | 'invoiceNo' | 'uhid' | 'date' | 'time'> & { date?: string }) => PatientInvoice;
  updateInvoice: (id: string, updated: Partial<PatientInvoice>) => void;
  deleteInvoice: (id: string) => void;
  collectInvoicePayment: (id: string, amount: number, mode: PaymentMode, ref?: string) => void;
  expenses: Expense[];
  addExpense: (exp: Omit<Expense, 'id' | 'voucherNo'>) => void;
  deleteExpense: (id: string) => void;
  doctorSettlements: DoctorSettlement[];
  createDoctorSettlement: (data: Omit<DoctorSettlement, 'id' | 'settlementNo'>) => void;
  cashbook: CashbookEntry[];
  addCashbookEntry: (entry: Omit<CashbookEntry, 'id' | 'voucherNo' | 'date' | 'time'>) => void;
  shiftRecords: ShiftCloseRecord[];
  addShiftRecord: (rec: Omit<ShiftCloseRecord, 'id' | 'timestamp'>) => void;
  // Date filtering
  dateFilter: DateFilterType;
  setDateFilter: (filter: DateFilterType) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  // Computed filter helper
  filteredInvoices: PatientInvoice[];
  filteredExpenses: PatientExpenseSummary;
  // Financial summaries
  summary: FinancialSummary;
  resetToDefaultData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
}

interface PatientExpenseSummary {
  list: Expense[];
  total: number;
}

interface FinancialSummary {
  grossBilled: number;
  totalCollected: number;
  uncollectedDues: number;
  cashCollected: number;
  upiCollected: number;
  bankCollected: number;
  tpaApproved: number;
  totalExpenses: number;
  netOperatingSurplus: number;
  doctorPendingShares: number;
  doctorTotalEarned: number;
  doctorTotalSettled: number;
  cashInHandEst: number;
  sbiBalanceEst: number;
  hdfcBalanceEst: number;
  opdCount: number;
  ipdCount: number;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<HospitalProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : initialHospitalProfile;
    } catch {
      return initialHospitalProfile;
    }
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_doctors`);
      return saved ? JSON.parse(saved) : initialDoctors;
    } catch {
      return initialDoctors;
    }
  });

  const [invoices, setInvoices] = useState<PatientInvoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
      return saved ? JSON.parse(saved) : initialInvoices;
    } catch {
      return initialInvoices;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      return saved ? JSON.parse(saved) : initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const [doctorSettlements, setDoctorSettlements] = useState<DoctorSettlement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_doc_settlements`);
      return saved ? JSON.parse(saved) : initialDoctorSettlements;
    } catch {
      return initialDoctorSettlements;
    }
  });

  const [cashbook, setCashbook] = useState<CashbookEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cashbook`);
      return saved ? JSON.parse(saved) : initialCashbook;
    } catch {
      return initialCashbook;
    }
  });

  const [shiftRecords, setShiftRecords] = useState<ShiftCloseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_shifts`);
      return saved ? JSON.parse(saved) : initialShiftRecords;
    } catch {
      return initialShiftRecords;
    }
  });

  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-11-01');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_doctors`, JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_doc_settlements`, JSON.stringify(doctorSettlements));
  }, [doctorSettlements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_cashbook`, JSON.stringify(cashbook));
  }, [cashbook]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shifts`, JSON.stringify(shiftRecords));
  }, [shiftRecords]);

  // Actions
  const updateProfile = (updated: HospitalProfile) => {
    setProfile(updated);
  };

  const addDoctor = (doc: Omit<Doctor, 'id'>) => {
    const newDoc: Doctor = {
      ...doc,
      id: `doc-${Date.now()}`,
    };
    setDoctors(prev => [...prev, newDoc]);
  };

  const updateDoctor = (id: string, updated: Partial<Doctor>) => {
    setDoctors(prev => prev.map(d => (d.id === id ? { ...d, ...updated } : d)));
  };

  const addInvoice = (invData: Omit<PatientInvoice, 'id' | 'invoiceNo' | 'uhid' | 'date' | 'time'> & { date?: string }): PatientInvoice => {
    const todayStr = invData.date || new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const count = invoices.length + 1;
    const invNumber = `MMH/2026/${String(480 + count).padStart(4, '0')}`;
    const uhidNumber = `MMH-P-${1040 + count}`;

    const newInvoice: PatientInvoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNo: invNumber,
      uhid: uhidNumber,
      date: todayStr,
      time: timeStr,
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Also register in cashbook if payment made in cash
    if (newInvoice.amountPaid > 0) {
      const isCash = newInvoice.paymentMode === 'Cash';
      const isBank = newInvoice.paymentMode === 'Bank Transfer' || newInvoice.paymentMode === 'Card';
      const accountTarget = isCash ? 'Cash-in-Hand' : isBank ? 'SBI Main Account' : 'Cash-in-Hand';

      const cbEntry: CashbookEntry = {
        id: `cb-${Date.now()}`,
        voucherNo: `CB-REC-${String(count).padStart(3, '0')}`,
        date: todayStr,
        time: timeStr,
        type: 'Receipt',
        account: accountTarget,
        counter: newInvoice.counter || 'Accounts Counter',
        narration: `${newInvoice.patientType} Collection - ${newInvoice.patientName} (${invNumber}) via ${newInvoice.paymentMode}`,
        amount: newInvoice.amountPaid,
        relatedId: newInvoice.id,
      };
      setCashbook(prev => [cbEntry, ...prev]);
    }

    return newInvoice;
  };

  const updateInvoice = (id: string, updated: Partial<PatientInvoice>) => {
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, ...updated } : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    setCashbook(prev => prev.filter(cb => cb.relatedId !== id));
  };

  const collectInvoicePayment = (id: string, paymentAmt: number, mode: PaymentMode, ref?: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id !== id) return inv;
        const newPaid = inv.amountPaid + paymentAmt;
        const newBalance = Math.max(0, inv.grandTotal - newPaid);
        const newStatus = newBalance === 0 ? 'Paid' : 'Partial';

        // Add payment split record
        const splits = inv.paymentSplits ? [...inv.paymentSplits] : [];
        splits.push({ mode, amount: paymentAmt, reference: ref });

        return {
          ...inv,
          amountPaid: newPaid,
          balanceDue: newBalance,
          status: newStatus,
          paymentSplits: splits,
        };
      })
    );

    // Record cashbook entry
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const isCash = mode === 'Cash';
    const isBank = mode === 'Bank Transfer' || mode === 'Card';
    const accountTarget = isCash ? 'Cash-in-Hand' : isBank ? 'SBI Main Account' : 'Cash-in-Hand';

    const cbEntry: CashbookEntry = {
      id: `cb-${Date.now()}`,
      voucherNo: `CB-PART-${Date.now().toString().slice(-4)}`,
      date: todayStr,
      time: timeStr,
      type: 'Receipt',
      account: accountTarget,
      counter: 'Accounts Counter',
      narration: `Payment settlement for Invoice ${id} via ${mode}${ref ? ` (${ref})` : ''}`,
      amount: paymentAmt,
      relatedId: id,
    };
    setCashbook(prev => [cbEntry, ...prev]);
  };

  const addExpense = (expData: Omit<Expense, 'id' | 'voucherNo'>) => {
    const count = expenses.length + 1;
    const voucherNo = `MMH/EXP/2026/${String(140 + count).padStart(4, '0')}`;
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      voucherNo,
    };

    setExpenses(prev => [newExp, ...prev]);

    // Cashbook entry
    const isCash = expData.paymentMode === 'Cash';
    const isSbi = expData.paymentMode === 'Bank Transfer (SBI)';
    const isHdfc = expData.paymentMode === 'Bank Transfer (HDFC)';
    const account = isCash ? 'Cash-in-Hand' : isSbi ? 'SBI Main Account' : isHdfc ? 'HDFC Current Account' : 'Cash-in-Hand';

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const cbEntry: CashbookEntry = {
      id: `cb-exp-${Date.now()}`,
      voucherNo: `CB-PAY-${String(count).padStart(3, '0')}`,
      date: expData.date,
      time: timeStr,
      type: 'Payment',
      account,
      counter: 'Main Accounts',
      narration: `Expense: ${expData.category} - ${expData.payeeName} (${voucherNo})`,
      amount: expData.amount,
      relatedId: newExp.id,
    };
    setCashbook(prev => [cbEntry, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setCashbook(prev => prev.filter(cb => cb.relatedId !== id));
  };

  const createDoctorSettlement = (data: Omit<DoctorSettlement, 'id' | 'settlementNo'>) => {
    const count = doctorSettlements.length + 1;
    const settlementNo = `MMH/DOC-SET/2026/${String(20 + count).padStart(3, '0')}`;

    const newSettlement: DoctorSettlement = {
      ...data,
      id: `set-${Date.now()}`,
      settlementNo,
    };

    setDoctorSettlements(prev => [newSettlement, ...prev]);

    // Mark doctor shares in invoices as settled
    setInvoices(prev =>
      prev.map(inv => {
        if (data.invoiceIds.includes(inv.id)) {
          return {
            ...inv,
            doctorShares: inv.doctorShares.map(ds =>
              ds.doctorId === data.doctorId
                ? { ...ds, isSettled: true, settlementId: newSettlement.id }
                : ds
            ),
          };
        }
        return inv;
      })
    );

    // Auto-create expense entry for hospital accounts
    addExpense({
      date: data.date,
      category: 'Doctor Share Payout',
      payeeName: `${data.doctorName} (Net Payout after ${data.tdsPercent}% TDS)`,
      description: `Doctor share settlement ${settlementNo} for ${data.periodDescription}. Gross: ₹${data.grossAmount}, TDS: ₹${data.tdsAmount}, Net: ₹${data.netPayable}`,
      amount: data.netPayable,
      paymentMode: data.paymentMode,
      refNumber: data.bankRef,
      approvedBy: profile.directorName,
      notes: `TDS of ₹${data.tdsAmount} credited under Section 194J for PAN verification.`,
    });
  };

  const addCashbookEntry = (entry: Omit<CashbookEntry, 'id' | 'voucherNo' | 'date' | 'time'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const count = cashbook.length + 1;
    const prefix = entry.type === 'Receipt' ? 'CB-REC' : entry.type === 'Payment' ? 'CB-PAY' : 'CB-CONTRA';

    const newCb: CashbookEntry = {
      ...entry,
      id: `cb-man-${Date.now()}`,
      voucherNo: `${prefix}-${String(count).padStart(3, '0')}`,
      date: todayStr,
      time: timeStr,
    };
    setCashbook(prev => [newCb, ...prev]);
  };

  const addShiftRecord = (rec: Omit<ShiftCloseRecord, 'id' | 'timestamp'>) => {
    const newRecord: ShiftCloseRecord = {
      ...rec,
      id: `shift-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
    };
    setShiftRecords(prev => [newRecord, ...prev]);
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setProfile(initialHospitalProfile);
    setDoctors(initialDoctors);
    setInvoices(initialInvoices);
    setExpenses(initialExpenses);
    setDoctorSettlements(initialDoctorSettlements);
    setCashbook(initialCashbook);
    setShiftRecords(initialShiftRecords);
  };

  const exportDatabaseJson = () => {
    const data = {
      hospital: profile,
      doctors,
      invoices,
      expenses,
      doctorSettlements,
      cashbook,
      shiftRecords,
      exportedAt: new Date().toISOString(),
      systemVersion: '1.0.0',
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `MangalMurti_Hospital_Accounts_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.hospital) setProfile(parsed.hospital);
      if (Array.isArray(parsed.doctors)) setDoctors(parsed.doctors);
      if (Array.isArray(parsed.invoices)) setInvoices(parsed.invoices);
      if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (Array.isArray(parsed.doctorSettlements)) setDoctorSettlements(parsed.doctorSettlements);
      if (Array.isArray(parsed.cashbook)) setCashbook(parsed.cashbook);
      if (Array.isArray(parsed.shiftRecords)) setShiftRecords(parsed.shiftRecords);
      return true;
    } catch (e) {
      console.error('Failed to import database JSON', e);
      return false;
    }
  };

  // Date filtering logic
  const dateMatch = (itemDateStr: string): boolean => {
    if (dateFilter === 'all') return true;

    const itemDate = new Date(itemDateStr);
    const today = new Date('2026-11-01'); // Using system reference time
    const todayStr = '2026-11-01';

    if (dateFilter === 'today') {
      return itemDateStr === todayStr;
    }
    if (dateFilter === 'yesterday') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().split('T')[0];
      return itemDateStr === yestStr;
    }
    if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return itemDate >= sevenDaysAgo && itemDate <= today;
    }
    if (dateFilter === 'month') {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return itemDate >= firstOfMonth && itemDate <= today;
    }
    if (dateFilter === 'fy') {
      // Indian FY 2026-27 starts April 1, 2026
      const fyStart = new Date('2026-04-01');
      const fyEnd = new Date('2027-03-31');
      return itemDate >= fyStart && itemDate <= fyEnd;
    }
    if (dateFilter === 'custom') {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return itemDate >= start && itemDate <= end;
    }
    return true;
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => dateMatch(inv.date));
  }, [invoices, dateFilter, customStartDate, customEndDate]);

  const filteredExpenses = useMemo(() => {
    const list = expenses.filter(exp => dateMatch(exp.date));
    const total = list.reduce((acc, curr) => acc + curr.amount, 0);
    return { list, total };
  }, [expenses, dateFilter, customStartDate, customEndDate]);

  // Overall and filtered financial metrics
  const summary: FinancialSummary = useMemo(() => {
    let grossBilled = 0;
    let totalCollected = 0;
    let uncollectedDues = 0;
    let cashCollected = 0;
    let upiCollected = 0;
    let bankCollected = 0;
    let tpaApproved = 0;
    let opdCount = 0;
    let ipdCount = 0;

    filteredInvoices.forEach(inv => {
      grossBilled += inv.grandTotal;
      totalCollected += inv.amountPaid;
      uncollectedDues += inv.balanceDue;

      if (inv.patientType === 'OPD') opdCount++;
      if (inv.patientType === 'IPD' || inv.patientType === 'DayCare' || inv.patientType === 'Emergency') ipdCount++;

      if (inv.paymentMode === 'Cash') cashCollected += inv.amountPaid;
      else if (inv.paymentMode === 'UPI') upiCollected += inv.amountPaid;
      else if (inv.paymentMode === 'Card' || inv.paymentMode === 'Bank Transfer') bankCollected += inv.amountPaid;
      else if (inv.paymentMode === 'TPA / Insurance') {
        tpaApproved += inv.amountPaid;
      } else if (inv.paymentMode === 'Multiple' && inv.paymentSplits) {
        inv.paymentSplits.forEach(s => {
          if (s.mode === 'Cash') cashCollected += s.amount;
          else if (s.mode === 'UPI') upiCollected += s.amount;
          else if (s.mode === 'Card' || s.mode === 'Bank Transfer') bankCollected += s.amount;
          else if (s.mode === 'TPA / Insurance') tpaApproved += s.amount;
        });
      } else {
        cashCollected += inv.amountPaid; // fallback
      }
    });

    const totalExpenses = filteredExpenses.total;
    const netOperatingSurplus = totalCollected - totalExpenses;

    // Doctor shares calculation
    let doctorPendingShares = 0;
    let doctorTotalEarned = 0;
    let doctorTotalSettled = 0;

    invoices.forEach(inv => {
      inv.doctorShares?.forEach(ds => {
        doctorTotalEarned += ds.shareAmount;
        if (ds.isSettled) {
          doctorTotalSettled += ds.shareAmount;
        } else {
          doctorPendingShares += ds.shareAmount;
        }
      });
    });

    // Estimation of Cash-in-Hand and Bank balances from cashbook
    let cashInHandEst = 25000; // Baseline initial balance
    let sbiBalanceEst = 485000;
    let hdfcBalanceEst = 260000;

    cashbook.forEach(cb => {
      const delta = cb.type === 'Receipt' ? cb.amount : -cb.amount;
      if (cb.account === 'Cash-in-Hand') cashInHandEst += delta;
      else if (cb.account === 'SBI Main Account') sbiBalanceEst += delta;
      else if (cb.account === 'HDFC Current Account') hdfcBalanceEst += delta;
    });

    return {
      grossBilled,
      totalCollected,
      uncollectedDues,
      cashCollected,
      upiCollected,
      bankCollected,
      tpaApproved,
      totalExpenses,
      netOperatingSurplus,
      doctorPendingShares,
      doctorTotalEarned,
      doctorTotalSettled,
      cashInHandEst: Math.max(0, cashInHandEst),
      sbiBalanceEst: Math.max(0, sbiBalanceEst),
      hdfcBalanceEst: Math.max(0, hdfcBalanceEst),
      opdCount,
      ipdCount,
    };
  }, [filteredInvoices, filteredExpenses, invoices, cashbook]);

  return (
    <HospitalContext.Provider
      value={{
        profile,
        updateProfile,
        doctors,
        addDoctor,
        updateDoctor,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        collectInvoicePayment,
        expenses,
        addExpense,
        deleteExpense,
        doctorSettlements,
        createDoctorSettlement,
        cashbook,
        addCashbookEntry,
        shiftRecords,
        addShiftRecord,
        dateFilter,
        setDateFilter,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        filteredInvoices,
        filteredExpenses,
        summary,
        resetToDefaultData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
