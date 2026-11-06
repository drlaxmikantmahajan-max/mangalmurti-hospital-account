/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InvoicesView } from './components/InvoicesView';
import { InvoiceModal } from './components/InvoiceModal';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';
import { ExpensesView } from './components/ExpensesView';
import { ExpenseModal } from './components/ExpenseModal';
import { DoctorShareView } from './components/DoctorShareView';
import { DayBookView } from './components/DayBookView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { APKModal } from './components/APKModal';
import { PatientInvoice } from './types';

function HospitalApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PatientInvoice | null>(null);
  const { profile } = useHospital();

  const handleInvoiceCreated = (newInv: PatientInvoice) => {
    setSelectedInvoice(newInv);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Hospital Global Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
        onOpenNewExpense={() => setIsExpenseModalOpen(true)}
        onOpenAPKModal={() => setIsAPKModalOpen(true)}
      />

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onViewInvoice={(inv) => setSelectedInvoice(inv)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesView
            onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
            onViewInvoice={(inv) => setSelectedInvoice(inv)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            onOpenNewExpense={() => setIsExpenseModalOpen(true)}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorShareView />
        )}

        {activeTab === 'daybook' && (
          <DayBookView />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onCreated={handleInvoiceCreated}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <PrintInvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      <APKModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
      />

      {/* Hospital Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{profile.name}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.marathiName}</span>
            <span aria-hidden="true">·</span>
            <span>Director: {profile.directorName}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Hospital Reg: {profile.hospitalRegNo}</span>
            <span aria-hidden="true">·</span>
            <span>Emergency 24x7: {profile.emergencyPhone}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HospitalProvider>
      <HospitalApp />
    </HospitalProvider>
  );
}
