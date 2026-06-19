'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  cafeName: string;
  onComplete: () => void;
}

export default function Preloader({ cafeName, onComplete }: PreloaderProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1450),
      setTimeout(() => onComplete(), 2200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const words = [
    "Welcome",
    `Welcome to ${cafeName}`,
    "Today's Menu"
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-bg-dark z-50 flex flex-col justify-center items-center px-6"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      }}
    >
      <div className="h-16 flex items-center justify-center overflow-hidden mb-8">
        <AnimatePresence mode="wait">
          <motion.h1
            key={step}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl sm:text-2xl md:text-3xl font-light tracking-widest uppercase text-center max-w-sm sm:max-w-md"
          >
            {words[step]}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Luxury loading track and indicator */}
      <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
        <motion.div
          className="absolute left-0 top-0 bottom-0 bg-accent-gold"
          initial={{ left: "-100%", width: "100%" }}
          animate={{ left: "100%" }}
          transition={{
            duration: 2.1,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}
