import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  X, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  QrCode, 
  Layers, 
  Sparkles 
} from 'lucide-react';

interface APKModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKModal: React.FC<APKModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'direct' | 'twa' | 'ios'>('direct');

  if (!isOpen) return null;

  const appUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800/80 border border-teal-600/40 flex items-center justify-center text-teal-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-300">Android APK & Mobile App</span>
                <span aria-hidden="true">·</span>
                <span className="text-[10px] text-teal-400">WebAPK v1.0</span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                Install Mangal Murti Hospital App
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Quick Install Banner */}
          <div className="p-4 bg-teal-50 border border-teal-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-teal-950 text-sm block">
                {isInstalled ? 'App Already Installed on this Device!' : 'Instant Android Installation'}
              </span>
              <p className="text-teal-800 text-[11px] leading-relaxed">
                {isInstalled
                  ? 'Running in standalone native window without browser address bars.'
                  : 'Installs as a native standalone app directly to your home screen with offline hospital accounts.'}
              </p>
            </div>

            {!isInstalled && isInstallable && (
              <button
                onClick={handleDirectInstall}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
              >
                <Download className="w-4 h-4" />
                <span>Install APK Now</span>
              </button>
            )}

            {isInstalled && (
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold px-3 py-1.5 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>Installed</span>
              </div>
            )}
          </div>

          {/* Guide Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveGuideTab('direct')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors text-center cursor-pointer ${
                activeGuideTab === 'direct'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Direct Android Phone Install
            </button>
            <button
              onClick={() => setActiveGuideTab('twa')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors text-center cursor-pointer ${
                activeGuideTab === 'twa'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Standalone .APK File (TWA)
            </button>
            <button
              onClick={() => setActiveGuideTab('ios')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors text-center cursor-pointer ${
                activeGuideTab === 'ios'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. iPhone / iPad
            </button>
          </div>

          {/* Tab 1: Direct Android Phone Install */}
          {activeGuideTab === 'direct' && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block text-xs">
                How to install on any Android phone (Chrome / Edge / Samsung Internet):
              </span>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                <li>
                  Open this link on your Android phone's <strong>Google Chrome</strong> or <strong>Edge</strong> browser.
                </li>
                <li>
                  Tap the <strong>three dots menu (⋮)</strong> at the top right of your browser.
                </li>
                <li>
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                </li>
                <li>
                  Android will automatically generate the <strong>WebAPK</strong>, placing the official <span className="font-semibold text-teal-900">MMH Accounts</span> icon in your app drawer alongside your native apps.
                </li>
              </ol>

              {/* Shareable Link Box */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block mb-1">
                  Share / Open on Doctor's Mobile Phone:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[11px] text-slate-700 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Standalone .APK File Package */}
          {activeGuideTab === 'twa' && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block text-xs">
                Build a Standalone Signed .APK file for Google Play or WhatsApp distribution:
              </span>
              <p className="text-slate-600 leading-relaxed">
                Because this app is fully PWA-certified with compliant manifest and service worker, it can be packaged in 1 click into a signed Android `.apk` or `.aab` package using <strong>PWABuilder</strong> or Google's <strong>Bubblewrap CLI</strong>.
              </p>

              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Package Name:</span>
                  <span className="text-slate-800 font-semibold">com.mangalmurti.hospital.accounts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">App Name:</span>
                  <span className="text-slate-800">Mangal Murti Hospital Accounts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Manifest:</span>
                  <span className="text-teal-800">Verified & Cached</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Generate Signed Android APK on PWABuilder</span>
                </a>
              </div>
            </div>
          )}

          {/* Tab 3: iOS Safari */}
          {activeGuideTab === 'ios' && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block text-xs">
                Install on iPhone or iPad (iOS Safari):
              </span>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                <li>
                  Open this link in <strong>Safari</strong> on your iPhone or iPad.
                </li>
                <li>
                  Tap the <strong>Share button</strong> (square with arrow pointing up) at the bottom toolbar.
                </li>
                <li>
                  Scroll down the action sheet and select <strong>"Add to Home Screen"</strong>.
                </li>
                <li>
                  Tap <strong>"Add"</strong> in the top-right corner. The Mangal Murti Hospital icon will appear on your home screen and open in full-screen standalone mode.
                </li>
              </ol>
            </div>
          )}

          {/* Features Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 block text-[11px]">Offline Local Storage</span>
                <span className="text-[10px] text-slate-500">Works without active internet</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 block text-[11px]">Native Fullscreen</span>
                <span className="text-[10px] text-slate-500">No browser URLs or tabs</span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
