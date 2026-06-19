'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  cafeName: string;
  logoText: string;
  status: string;
}

export default function Header({ cafeName, logoText, status }: HeaderProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOpen = status.toLowerCase() === 'open now';

  return (
    <motion.header 
      className="sticky top-0 z-40 w-full glass-panel py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col">
        <span className="text-[10px] tracking-[0.3em] text-accent-gold font-light uppercase leading-none mb-1">
          {logoText}
        </span>
        <span className="text-base font-light tracking-widest text-white uppercase leading-none">
          {cafeName}
        </span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            {isOpen && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-white uppercase">
            {status}
          </span>
        </div>

        {time && (
          <span className="text-[10px] sm:text-xs font-mono tracking-widest text-secondary-text border-l border-white/10 pl-6 hidden xs:inline">
            {time}
          </span>
        )}
      </div>
    </motion.header>
  );
}
