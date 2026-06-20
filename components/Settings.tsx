'use client';

import React, { useState, useRef } from 'react';
import { MenuData, CafeSettings } from '@/types/menu';
import { 
  Save, Key, Database, Globe, Sliders, Check, 
  AlertCircle, RefreshCw, Download, Printer, QrCode, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

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

  const [qrUrl, setQrUrl] = useState('https://menu-beta-tau.vercel.app');
  const [qrColor, setQrColor] = useState('#d4af37'); // Gold Accent
  const qrRef = useRef<SVGSVGElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrSvgHtml = qrRef.current ? qrRef.current.outerHTML : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Menu QR Code - ${data.cafeSettings.cafeName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: 'Outfit', sans-serif;
              background-color: #fafafa;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .standee {
              width: 320px;
              padding: 40px 30px;
              background: #0d0d0d;
              color: #ffffff;
              border-radius: 24px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0,0,0,0.15);
              border: 1px solid rgba(255,255,255,0.05);
              position: relative;
              overflow: hidden;
            }
            .standee::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%);
              pointer-events: none;
            }
            .logo-header {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.25em;
              color: #d4af37;
              text-transform: uppercase;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              margin: 0 0 10px 0;
              letter-spacing: -0.02em;
            }
            .subtitle {
              font-size: 12px;
              color: #a3a3a3;
              font-weight: 300;
              margin-bottom: 30px;
              line-height: 1.5;
            }
            .qr-container {
              background: #ffffff;
              padding: 20px;
              border-radius: 18px;
              display: inline-block;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              margin-bottom: 30px;
            }
            .qr-container svg {
              display: block;
              width: 180px;
              height: 180px;
            }
            .footer-tag {
              font-size: 11px;
              color: #d4af37;
              font-weight: 600;
              letter-spacing: 0.05em;
            }
            .address {
              font-size: 9px;
              color: #737373;
              margin-top: 10px;
              font-weight: 300;
            }
            @media print {
              body {
                background: none;
              }
              .standee {
                box-shadow: none;
                border: none;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="standee">
            <div class="logo-header">${data.cafeSettings.logoText || 'EVOLO'}</div>
            <h1 class="title">Digital Menu</h1>
            <p class="subtitle">Scan the QR code to browse our menu and place order directly from your phone.</p>
            <div class="qr-container">
              ${qrSvgHtml}
            </div>
            <div class="footer-tag">${data.cafeSettings.cafeName}</div>
            ${data.cafeSettings.address ? `<div class="address">${data.cafeSettings.address}</div>` : ''}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadSVG = () => {
    if (!qrRef.current) return;
    const svgData = qrRef.current.outerHTML;
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${data.cafeSettings.cafeName.toLowerCase().replace(/\s+/g, '-')}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

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

          <div className="glass-card rounded-[24px] p-6 space-y-6">
            <div className="border-b border-white/5 pb-4 text-center">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-white flex items-center justify-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-accent-gold" />
                QR Code Portal
              </span>
              <p className="text-secondary-text text-[9px] font-light mt-1">
                Generate, style, and print high-quality QR codes for your cafe tables.
              </p>
            </div>

            {/* Premium QR Code Preview */}
            <div className="relative group">
              <div className="w-40 h-40 bg-white rounded-2xl mx-auto flex items-center justify-center p-4 border border-white/10 shadow-xl transition-all duration-300 group-hover:scale-105">
                <QRCodeSVG
                  ref={qrRef}
                  value={qrUrl}
                  size={144}
                  bgColor="#ffffff"
                  fgColor={qrColor === '#ffffff' ? '#000000' : qrColor}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="absolute top-2 right-2 bg-accent-gold/10 text-accent-gold border border-accent-gold/20 text-[8px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
                Active QR
              </div>
            </div>

            {/* QR URL Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] tracking-wider text-secondary-text uppercase flex items-center gap-1">
                Target URL
                <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline flex items-center">
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              </label>
              <input
                type="url"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                placeholder="https://menu-beta-tau.vercel.app"
                className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-gold/30"
              />
            </div>

            {/* Customization Options */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="space-y-1.5">
                <label className="text-[9px] tracking-wider text-secondary-text uppercase">QR Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-full bg-[#090909] border border-white/10 rounded-lg px-2 text-[10px] text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setQrColor(data.cafeSettings.themeColor || '#d4af37')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white text-[9px] font-semibold uppercase tracking-wider py-2.5 px-3 rounded-lg border border-white/5 transition-all duration-300 cursor-pointer"
                >
                  Use Theme Color
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadSVG}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-[10px] font-bold tracking-wider bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all duration-300 cursor-pointer"
              >
                <Download className="w-3 h-3 text-accent-gold" />
                Download SVG
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-[10px] font-bold tracking-wider bg-accent-gold text-bg-dark hover:bg-accent-gold/90 transition-all duration-300 cursor-pointer"
              >
                <Printer className="w-3 h-3" />
                Print Stand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
