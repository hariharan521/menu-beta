'use client';

import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <motion.div 
      className="w-full max-w-xl mx-auto px-6 mb-10"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-secondary-text/50" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search your favourite drink..."
          className="w-full bg-[#161616]/40 backdrop-blur-xl border border-white/8 rounded-full py-3.5 pl-12 pr-12 text-sm text-white placeholder-secondary-text/55 focus:outline-none focus:border-accent-gold/30 focus:ring-1 focus:ring-accent-gold/20 transition-all duration-300 font-light tracking-widest uppercase text-xs"
        />

        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-5 flex items-center text-secondary-text/50 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
