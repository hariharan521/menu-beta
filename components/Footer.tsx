'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-16 px-6 md:px-12 mt-12 border-t border-white/5 bg-bg-dark">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-5">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-[1px] bg-white/5" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-gold/30" />
          <div className="w-8 h-[1px] bg-white/5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-white text-sm font-light tracking-[0.25em] uppercase">
            Thank You ❤️
          </h3>
          <p className="text-secondary-text text-[10px] tracking-[0.2em] uppercase font-light">
            Visit Again
          </p>
        </div>

        <p className="text-[9px] tracking-widest text-secondary-text/30 uppercase font-light font-mono pt-4">
          &copy; {currentYear} Evolo Cafe. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
