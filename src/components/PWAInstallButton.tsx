import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenAPKModal: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenAPKModal }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        onOpenAPKModal();
      }
    } else {
      onOpenAPKModal();
    }
  };

  if (isInstalled) {
    return (
      <button
        onClick={onOpenAPKModal}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
        title="App Installed - Click for APK & Mobile settings"
      >
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Installed as App</span>
        <span className="sm:hidden">App</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer animate-pulse-subtle"
      title="Install as Android APK or Home Screen App"
    >
      <Smartphone className="w-3.5 h-3.5 text-teal-200" />
      <span>Install APK / App</span>
    </button>
  );
};
