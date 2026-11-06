import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HospitalProfile, Doctor } from '../types';
import { 
  Building2, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Plus, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2,
  Trash2,
  Smartphone,
  ExternalLink,
  Copy
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    doctors, 
    addDoctor, 
    updateDoctor, 
    exportDatabaseJson, 
    importDatabaseJson, 
    resetToDefaultData 
  } = useHospital();

  const [formData, setFormData] = useState<HospitalProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newDoctorModal, setNewDoctorModal] = useState(false);

  // New Doctor form
  const [docName, setDocName] = useState('');
  const [docMarathi, setDocMarathi] = useState('');
  const [docQual, setDocQual] = useState('');
  const [docSpec, setDocSpec] = useState('');
  const [docMobile, setDocMobile] = useState('');
  const [docOpdShare, setDocOpdShare] = useState(75);
  const [docSurgShare, setDocSurgShare] = useState(70);
  const [docPan, setDocPan] = useState('');
  const [docBank, setDocBank] = useState('');
  const [docIfsc, setDocIfsc] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    addDoctor({
      name: docName.trim(),
      marathiName: docMarathi.trim() || undefined,
      qualification: docQual.trim() || 'M.B.B.S.',
      specialization: docSpec.trim() || 'Consultant',
      mobile: docMobile.trim() || 'Not Provided',
      opdSharePercent: Number(docOpdShare) || 70,
      surgerySharePercent: Number(docSurgShare) || 65,
      panNumber: docPan.trim() || 'PAN-PENDING',
      bankAccount: docBank.trim() || 'A/C-PENDING',
      ifscCode: docIfsc.trim() || 'SBIN0000473',
    });

    setNewDoctorModal(false);
    setDocName('');
    setDocMarathi('');
    setDocQual('');
    setDocSpec('');
    setDocMobile('');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseJson(content);
        if (ok) {
          alert('Database restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Hospital Master Configuration & Data Vault
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Hospital Registration Details</span>
            <span aria-hidden="true">·</span>
            <span>Doctor Roster & Share %</span>
            <span aria-hidden="true">·</span>
            <span>Bank Accounts & JSON Backup</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportDatabaseJson}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Backup (.JSON)</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Hospital configuration and billing profile updated successfully!</span>
        </div>
      )}

      {/* Hospital Master Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900">Hospital Legal & Billing Identity</h3>
          <span className="text-xs text-slate-400">Used on all printed bills and tax invoices</span>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Hospital Name (English) *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Hospital Name (Marathi / Devnagari)</label>
              <input
                type="text"
                value={formData.marathiName}
                onChange={e => setFormData({ ...formData, marathiName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Tagline / Facility Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Medical Director / Chief Doctor *</label>
              <input
                type="text"
                required
                value={formData.directorName}
                onChange={e => setFormData({ ...formData, directorName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Director Qualifications</label>
              <input
                type="text"
                value={formData.directorQualification}
                onChange={e => setFormData({ ...formData, directorQualification: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Medical Council Reg. No (MMC)</label>
              <input
                type="text"
                value={formData.directorRegNo}
                onChange={e => setFormData({ ...formData, directorRegNo: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Hospital Reg. / Clinical Establishment ID</label>
              <input
                type="text"
                value={formData.hospitalRegNo}
                onChange={e => setFormData({ ...formData, hospitalRegNo: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Hospital PAN</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={e => setFormData({ ...formData, panNumber: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Address / Street</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">City & District</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone / Landline</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-teal-50/40 border border-teal-100 rounded-lg">
            <div>
              <label className="block text-slate-700 font-medium mb-1">SBI Main A/C Number</label>
              <input
                type="text"
                value={formData.sbiAccountNumber}
                onChange={e => setFormData({ ...formData, sbiAccountNumber: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">SBI IFSC Code</label>
              <input
                type="text"
                value={formData.sbiIfsc}
                onChange={e => setFormData({ ...formData, sbiIfsc: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Hospital UPI ID (QR)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Hospital Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Doctor Roster & Commission Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Doctor Roster & Fee Schedule</h3>
            <p className="text-xs text-slate-500">Configured consultants and their standard revenue percentage</p>
          </div>
          <button
            onClick={() => setNewDoctorModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Consultant</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Doctor Name</th>
                <th className="py-2.5 px-3">Specialization & Qualification</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-center">OPD Share %</th>
                <th className="py-2.5 px-3 text-center">Surgery Share %</th>
                <th className="py-2.5 px-3">Bank A/C</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {d.name}
                    {d.marathiName && <span className="text-[11px] text-slate-400 block font-normal">{d.marathiName}</span>}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="font-medium block">{d.specialization}</span>
                    <span className="text-[11px] text-slate-500">{d.qualification}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {d.mobile}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-900">
                    {d.opdSharePercent}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-900">
                    {d.surgerySharePercent}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                    {d.bankAccount} ({d.ifscCode})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup & System Maintenance */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Database Backup, Import & Disaster Recovery</h3>
          <p className="text-xs text-slate-500">Securely backup or restore full hospital accounts, invoices, and vouchers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Export */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-slate-900 block">Export Full JSON Backup</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Download all hospital invoices, expenses, cashbook vouchers, and doctor settlements as a structured JSON file.
              </p>
            </div>
            <button
              onClick={exportDatabaseJson}
              className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-slate-900 block">Restore from Backup</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Restore hospital data from a previously downloaded .json backup file.
              </p>
            </div>
            <label className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File to Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset */}
          <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-rose-900 block">Reset Sample Records</span>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Reload authentic initial seed data for Mangal Murti Hospital (Dr. Laxmikant Mahajan).
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all records to the original template? Current changes will be replaced.')) {
                  resetToDefaultData();
                }
              }}
              className="w-full py-2 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Seed Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Android APK & Mobile App Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-teal-800" />
              Android Mobile App & APK Information
            </h3>
            <p className="text-xs text-slate-500">
              Install directly as a standalone Android app (WebAPK) or build an APK file for Google Play / WhatsApp
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            Package: com.mangalmurti.hospital.accounts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-lg space-y-2">
            <span className="font-bold text-teal-950 block">Option 1: Direct Android Phone Install (WebAPK)</span>
            <p className="text-teal-800 leading-relaxed text-[11px]">
              Open this link on any Android phone using Google Chrome, tap <strong>(⋮) Menu → "Install app"</strong>. Android compiles and installs a genuine system APK on your phone with zero app store setup required.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.origin}
                className="flex-1 px-2.5 py-1 bg-white border border-teal-200 rounded text-[11px] font-mono text-slate-700"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  alert('App link copied to clipboard! Share it with doctors or staff.');
                }}
                className="px-2.5 py-1 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="font-bold text-slate-900 block">Option 2: Download Signed Standalone .APK File</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Need a physical <span className="font-mono font-bold">.apk</span> installer file to sideload or upload to Google Play? Use PWABuilder (Google / Microsoft standard) to generate the signed APK bundle directly from this manifest.
            </p>
            <div className="pt-1">
              <a
                href={`https://www.pwabuilder.com?url=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open PWABuilder APK Generator</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {newDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl p-5 text-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Add New Consultant Doctor
            </h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rohan Deshpande"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. MS (ENT), DLO"
                    value={docQual}
                    onChange={e => setDocQual(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. ENT Surgeon"
                    value={docSpec}
                    onChange={e => setDocSpec(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">OPD Share %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={docOpdShare}
                    onChange={e => setDocOpdShare(parseInt(e.target.value) || 0)}
                    className="w-full p-1.5 text-center font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Surgery Share %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={docSurgShare}
                    onChange={e => setDocSurgShare(parseInt(e.target.value) || 0)}
                    className="w-full p-1.5 text-center font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mobile</label>
                  <input
                    type="text"
                    value={docMobile}
                    onChange={e => setDocMobile(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={docPan}
                    onChange={e => setDocPan(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewDoctorModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs cursor-pointer"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
