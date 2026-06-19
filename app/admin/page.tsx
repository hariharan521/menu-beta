'use client';

import { useState, useEffect } from 'react';
import { MenuProvider, useMenu } from '@/hooks/useMenu';
import AdminLayout from '@/components/AdminLayout';
import Sidebar, { AdminTab } from '@/components/Sidebar';
import MenuEditor from '@/components/MenuEditor';
import Settings from '@/components/Settings';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Eye, EyeOff, Coffee, BarChart3, Smartphone, Clock } from 'lucide-react';

function DashboardOverview({ menuData }: { menuData: any }) {
  const { categories, items, cafeSettings } = menuData;

  const cards = [
    { label: 'Total Categories', value: categories.length, icon: Coffee, desc: 'Active menu categories' },
    { label: 'Total Dishes', value: items.length, icon: BarChart3, desc: 'Dishes in rotation' },
    { label: 'Scans Today', value: '184', icon: Smartphone, desc: 'Total visitors tracked' },
    { label: 'Status', value: cafeSettings.status, icon: Clock, desc: cafeSettings.openingHours },
  ];

  return (
    <div className="flex-grow p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-xl font-light tracking-widest text-white uppercase">Overview</h1>
        <p className="text-secondary-text text-xs font-light">Real-time metrics and system metrics of your digital QR Menu.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] tracking-widest text-secondary-text uppercase font-semibold">{card.label}</span>
                <Icon className="w-4 h-4 text-accent-gold" />
              </div>
              <div className="space-y-1">
                <span className="text-xl font-light text-white tracking-wide">{card.value}</span>
                <p className="text-[9px] text-secondary-text/50 font-light leading-none">{card.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-[24px] p-6 space-y-6"
      >
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-white text-[10px] font-semibold tracking-widest uppercase">Popular Scan Hours</h2>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 pt-4">
          {[15, 28, 52, 94, 138, 114, 82, 48, 22].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <motion.div
                className="w-full bg-accent-gold/20 hover:bg-accent-gold/35 border-t border-accent-gold/35 rounded-t-lg transition-colors cursor-pointer"
                initial={{ height: 0 }}
                animate={{ height: `${(val / 138) * 100}%` }}
                transition={{ duration: 1.1, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className="text-[8px] text-secondary-text/40 font-mono">
                {idx + 9 === 12 ? '12 PM' : idx + 9 > 12 ? `${idx + 9 - 12} PM` : `${idx + 9} AM`}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AdminContent() {
  const { menuData, loading, error, saveMenu } = useMenu();
  const [token, setToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    const savedSession = localStorage.getItem('admin_session');
    if (savedSession) {
      setToken(savedSession);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError(false);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        localStorage.setItem('admin_session', data.token);
      } else {
        setLoginError(true);
        setTimeout(() => setLoginError(false), 600);
      }
    } catch (err) {
      console.error(err);
      setLoginError(true);
      setTimeout(() => setLoginError(false), 600);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_session');
  };

  const handleSaveMenu = async (updatedData: any) => {
    if (!token) return false;
    return await saveMenu(updatedData, token);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full max-w-sm glass-card rounded-[28px] p-8 space-y-6 ${
            loginError ? 'animate-shake' : ''
          }`}
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full border border-white/5 bg-[#161616]/40 flex items-center justify-center mx-auto text-accent-gold">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-white text-sm tracking-[0.25em] font-light uppercase">
                Admin Console
              </h1>
              <p className="text-secondary-text text-[9px] font-light tracking-widest uppercase">
                Enter credentials to unlock
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password..."
                  className="w-full bg-[#090909] border border-white/10 rounded-xl py-3 px-4 pr-12 text-xs text-white placeholder-secondary-text/35 focus:outline-none focus:border-accent-gold/30 focus:ring-1 focus:ring-accent-gold/25 transition-all font-light tracking-[0.2em]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-secondary-text/40 hover:text-white transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-400 text-[9px] tracking-widest uppercase font-semibold justify-center"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Authentication Denied</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-accent-gold hover:bg-accent-gold/90 text-bg-dark rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoggingIn ? 'Unlocking...' : 'Unlock Console'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center">
        <div className="w-10 h-10 rounded-full border-t border-accent-gold animate-spin mb-4" />
        <span className="text-[10px] tracking-[0.25em] text-secondary-text uppercase font-light animate-pulse">
          Opening Session...
        </span>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center px-6 text-center">
        <h2 className="text-white text-sm font-light tracking-widest mb-2 uppercase">Failed to Sync Console</h2>
        <p className="text-secondary-text text-[10px] font-light max-w-xs">{error || 'Server connection error'}</p>
        <button onClick={handleLogout} className="mt-4 px-5 py-2 bg-white/5 border border-white/10 text-[9px] tracking-widest uppercase rounded-full">
          Reset Session
        </button>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        cafeName={menuData.cafeSettings.cafeName}
      />
      
      <main className="flex-grow flex flex-col h-screen overflow-y-auto no-scrollbar bg-bg-dark">
        {activeTab === 'dashboard' && <DashboardOverview menuData={menuData} />}
        
        {activeTab === 'menu' && (
          <MenuEditor 
            initialData={menuData} 
            onSave={handleSaveMenu} 
          />
        )}
        
        {activeTab === 'settings' && (
          <Settings 
            initialData={menuData} 
            onSave={handleSaveMenu} 
            token={token}
          />
        )}
      </main>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <MenuProvider>
      <AdminContent />
    </MenuProvider>
  );
}
