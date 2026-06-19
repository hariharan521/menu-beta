'use client';

import { LayoutDashboard, Coffee, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export type AdminTab = 'dashboard' | 'menu' | 'settings';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
  cafeName: string;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, cafeName }: SidebarProps) {
  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu' as AdminTab, label: 'Menu Editor', icon: Coffee },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#161616]/40 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between h-auto md:h-screen md:sticky md:top-0">
      <div className="space-y-8">
        <div>
          <span className="text-[9px] tracking-[0.3em] text-accent-gold font-light uppercase block mb-1">
            Control Panel
          </span>
          <h2 className="text-white text-sm font-light tracking-widest uppercase">
            {cafeName}
          </h2>
        </div>

        <nav className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[10px] tracking-widest uppercase transition-all duration-300 relative focus:outline-none cursor-pointer"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTabBg"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/8"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                
                <Icon className={`w-4 h-4 z-10 transition-colors ${
                  isActive ? 'text-accent-gold' : 'text-secondary-text'
                }`} />
                <span className={`z-10 transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-secondary-text hover:text-white'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[10px] tracking-widest uppercase text-red-400/80 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-300 mt-8 focus:outline-none cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </aside>
  );
}
