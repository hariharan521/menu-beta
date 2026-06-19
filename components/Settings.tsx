'use client';

import React, { useState } from 'react';
import { MenuData, CafeSettings } from '@/types/menu';
import { 
  Save, Key, Database, Globe, Sliders, Check, 
  AlertCircle, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  initialData: MenuData;
  onSave: (data: MenuData) => Promise<boolean>;
  token: string;
}

export default function Settings({ initialData, onSave, token }: SettingsProps) {
  const [data, setData] = useState<MenuData>(initialData);
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSavingCafe, setIsSavingCafe] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string; section: 'cafe' | 'security' } | null>(null);

  const showStatus = (type: 'success' | 'error', message: string, section: 'cafe' | 'security') => {
    setStatus({ type, message, section });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSaveCafe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCafe(true);
    try {
      const success = await onSave(data);
      if (success) {
        showStatus('success', 'Cafe settings updated successfully', 'cafe');
      } else {
        showStatus('error', 'Failed to save cafe settings', 'cafe');
      }
    } catch (error) {
      showStatus('error', 'Error saving cafe settings', 'cafe');
    } finally {
      setIsSavingCafe(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
      showStatus('error', 'Please fill all password fields', 'security');
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      showStatus('error', 'New passwords do not match', 'security');
      return;
    }

    if (password.currentPassword !== token) {
      showStatus('error', 'Incorrect current password', 'security');
      return;
    }

    setIsSavingPass(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ newPassword: password.newPassword })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update password');
      }

      showStatus('success', 'Password updated successfully. Please re-authenticate.', 'security');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Delay logout slightly so they read the success message
      setTimeout(() => {
        localStorage.removeItem('admin_session');
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      showStatus('error', err.message || 'Error updating password', 'security');
    } finally {
      setIsSavingPass(false);
    }
  };

  const updateCafeField = (key: keyof CafeSettings, value: string) => {
    setData({
      ...data,
      cafeSettings: {
        ...data.cafeSettings,
        [key]: value
      }
    });
  };

  return (
    <div className="flex-grow p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-xl font-light tracking-widest text-white uppercase">System Settings</h1>
        <p className="text-secondary-text text-xs font-light">Configure cafe details, color palette, security credentials, and integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side: Fields */}
        <div className="md:col-span-8 space-y-8">
          
          {/* GENERAL SETTINGS */}
          <form onSubmit={handleSaveCafe} className="glass-card rounded-[24px] p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-white text-xs font-semibold tracking-widest uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent-gold" />
                Cafe Information
              </span>
              
              <button
                type="submit"
                disabled={isSavingCafe}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-[10px] font-semibold tracking-wider bg-accent-gold text-bg-dark hover:bg-accent-gold/90 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {isSavingCafe ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span>Save</span>
              </button>
            </div>

            <AnimatePresence>
              {status && status.section === 'cafe' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 rounded-lg text-xs flex items-center space-x-2 border ${
                    status.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-300 border-red-500/20'
                  }`}
                >
                  {status.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{status.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] tracking-wider text-secondary-text uppercase">Cafe Name</label>
                <input
                  type="text"
                  value={data.cafeSettings.cafeName}
                  onChange={(e) => updateCafeField('cafeName', e.target.value)}
                  className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] tracking-wider text-secondary-text uppercase">Logo Text (Header Brand)</label>
                <input
                  type="text"
                  value={data.cafeSettings.logoText}
                  onChange={(e) => updateCafeField('logoText', e.target.value)}
                  className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] tracking-wider text-secondary-text uppercase">Opening Status</label>
                <select
                  value={data.cafeSettings.status}
                  onChange={(e) => updateCafeField('status', e.target.value as any)}
                  className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                >
                  <option value="Open Now">● Open Now</option>
                  <option value="Closed">● Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] tracking-wider text-secondary-text uppercase">Theme Color Accent</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={data.cafeSettings.themeColor}
                    onChange={(e) => updateCafeField('themeColor', e.target.value)}
                    className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                  />
                  <div 
                    className="w-10 h-10 rounded-lg border border-white/15 flex-shrink-0"
                    style={{ backgroundColor: data.cafeSettings.themeColor }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] tracking-wider text-secondary-text uppercase">Hours of Operation</label>
                <input
                  type="text"
                  value={data.cafeSettings.openingHours}
                  onChange={(e) => updateCafeField('openingHours', e.target.value)}
                  className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] tracking-wider text-secondary-text uppercase">Telephone Contact</label>
                <input
                  type="text"
                  value={data.cafeSettings.phone}
                  onChange={(e) => updateCafeField('phone', e.target.value)}
                  className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] tracking-wider text-secondary-text uppercase">Physical Address</label>
              <input
                type="text"
                value={data.cafeSettings.address}
                onChange={(e) => updateCafeField('address', e.target.value)}
                className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
              />
            </div>
          </form>

          {/* PASSWORD SECURITY */}
          <form onSubmit={handleUpdatePassword} className="glass-card rounded-[24px] p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-white text-xs font-semibold tracking-widest uppercase flex items-center gap-2">
                <Key className="w-4 h-4 text-accent-gold" />
                Change Admin Password
              </span>
              
              <button
                type="submit"
                disabled={isSavingPass}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-[10px] font-semibold tracking-wider bg-accent-gold text-bg-dark hover:bg-accent-gold/90 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {isSavingPass ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span>Update</span>
              </button>
            </div>

            <AnimatePresence>
              {status && status.section === 'security' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 rounded-lg text-xs flex items-center space-x-2 border ${
                    status.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-300 border-red-500/20'
                  }`}
                >
                  {status.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{status.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] tracking-wider text-secondary-text uppercase">Current Admin Password</label>
                <input
                  type="password"
                  value={password.currentPassword}
                  onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                  placeholder="Enter current password..."
                  className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] tracking-wider text-secondary-text uppercase">New Password</label>
                  <input
                    type="password"
                    value={password.newPassword}
                    onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                    placeholder="New password..."
                    className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] tracking-wider text-secondary-text uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    value={password.confirmPassword}
                    onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                    placeholder="Confirm new password..."
                    className="w-full bg-[#090909] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Integrations (CMS Placeholder) */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-card rounded-[24px] p-6 space-y-6 opacity-60">
            <div className="border-b border-white/5 pb-4">
              <span className="text-secondary-text text-xs font-semibold tracking-widest uppercase flex items-center gap-2">
                <Database className="w-4 h-4" />
                CMS Integrations
              </span>
            </div>

            <p className="text-secondary-text text-[11px] font-light leading-relaxed">
              This application is currently in Local Sandbox Mode. Changes are saved directly to <code className="text-accent-gold/80 bg-white/5 px-1.5 py-0.5 rounded font-mono">/data/menu.json</code>.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] tracking-wider text-secondary-text/80 uppercase">Database Provider</span>
                <div className="bg-[#090909] border border-white/5 rounded-lg p-2.5 text-xs text-secondary-text/50 font-mono">
                  SUPABASE (Locked)
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] tracking-wider text-secondary-text/80 uppercase">Supabase URL</span>
                <input
                  type="text"
                  disabled
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-[#090909]/40 border border-white/5 rounded-lg p-2.5 text-xs text-secondary-text/30 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] tracking-wider text-secondary-text/80 uppercase">Supabase Anon Key</span>
                <input
                  type="password"
                  disabled
                  value="xxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#090909]/40 border border-white/5 rounded-lg p-2.5 text-xs text-secondary-text/30 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="text-[8px] tracking-widest font-bold text-accent-gold/80 border border-accent-gold/15 bg-accent-gold/5 p-2 rounded-lg text-center uppercase">
              V2 Database Upgrade Ready
            </div>
          </div>

          <div className="glass-card rounded-[24px] p-6 space-y-4 text-center">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-white flex items-center justify-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent-gold" />
              QR Code Portal
            </span>
            <p className="text-secondary-text text-[10px] font-light leading-relaxed">
              Scan this mockup in development to load the local client menu interface instantly.
            </p>
            {/* Simple CSS simulated QR block */}
            <div className="w-32 h-32 bg-white rounded-xl mx-auto flex items-center justify-center p-3 border-4 border-white/10 shadow-lg">
              <div className="w-full h-full bg-bg-dark rounded flex flex-col items-center justify-center relative">
                <div className="w-5 h-5 border border-white absolute top-2 left-2" />
                <div className="w-5 h-5 border border-white absolute top-2 right-2" />
                <div className="w-5 h-5 border border-white absolute bottom-2 left-2" />
                <span className="text-[8px] text-accent-gold font-bold font-mono tracking-tighter uppercase">EVOLO QR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
