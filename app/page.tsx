'use client';

import { useState, useEffect } from 'react';
import { MenuProvider, useMenu } from '@/hooks/useMenu';
import Preloader from '@/components/Preloader';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, ArrowLeft, Leaf, Sparkles } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import Image from 'next/image';

// Elegant Leaf Drifter component to match organic elements in the photo
function LeafOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Left Leaf */}
      <motion.div
        className="absolute -top-10 -left-10 text-emerald-500/10 w-32 h-32"
        animate={{ 
          rotate: [0, 8, -4, 0],
          y: [0, 5, -5, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <Leaf className="w-full h-full transform -rotate-45 fill-emerald-500/5 stroke-[0.5]" />
      </motion.div>

      {/* Top Right leaf */}
      <motion.div
        className="absolute top-12 right-1/3 text-emerald-600/5 w-16 h-16"
        animate={{ 
          rotate: [0, -10, 10, 0],
          x: [0, 4, -4, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Leaf className="w-full h-full fill-emerald-600/5 stroke-[0.3]" />
      </motion.div>

      {/* Center Left Leaf */}
      <motion.div
        className="absolute bottom-1/4 left-10 text-emerald-500/10 w-24 h-24"
        animate={{ 
          rotate: [0, 15, -15, 0],
          y: [0, -8, 8, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <Leaf className="w-full h-full fill-emerald-500/5 stroke-[0.4]" />
      </motion.div>
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center px-6 animate-pulse">
      <div className="w-48 h-6 bg-white/5 rounded mb-4" />
      <div className="w-32 h-4 bg-white/5 rounded" />
    </div>
  );
}

function MenuContent() {
  const { menuData, loading, error } = useMenu();
  const [showPreloader, setShowPreloader] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  if (loading) {
    return <MenuSkeleton />;
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center px-6 text-center">
        <h2 className="text-white text-sm font-light tracking-widest mb-2 uppercase">
          Failed to Load Menu
        </h2>
        <p className="text-secondary-text text-xs max-w-xs font-light">
          {error || 'Unable to connect to the server.'}
        </p>
      </div>
    );
  }

  const { cafeSettings, categories, items } = menuData;

  // Split categories for Left and Right columns
  const halfIndex = Math.ceil(categories.length / 2);
  const leftCategories = categories.slice(0, halfIndex);
  const rightCategories = categories.slice(halfIndex);

  const matchesSearch = (item: MenuItem) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showPreloader && (
          <Preloader
            cafeName={cafeSettings.cafeName}
            onComplete={() => setShowPreloader(false)}
          />
        )}
      </AnimatePresence>

      {!showPreloader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="h-screen w-screen bg-bg-dark overflow-hidden flex flex-col relative select-none"
        >
          {/* Subtle Organic Background Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-950/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-950/10 rounded-full blur-[140px] pointer-events-none" />
          
          <LeafOverlay />

          {/* MAIN PAGE CONTAINER */}
          <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full py-8 px-6 md:px-12 z-10 relative">
            
            {/* TOP BAR / HEADER */}
            <header className="flex justify-between items-start mb-6">
              {/* Back Arrow & Menu List Heading */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 text-white/40 hover:text-white transition-colors cursor-pointer mb-2">
                  <ArrowLeft className="w-4.5 h-4.5 stroke-[1.5]" />
                  <span className="text-[9px] tracking-widest uppercase font-light">Go Back</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90 leading-none">
                  Menu<br />List
                </h1>
              </div>

              {/* Cafe Branding Logo */}
              <div className="flex flex-col items-end text-right">
                {/* Logo Icon Mockup */}
                <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center bg-[#161616]/30 mb-2">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                </div>
                <span className="text-sm font-light tracking-[0.25em] text-white uppercase leading-none">
                  {cafeSettings.logoText}
                </span>
                <span className="text-[8px] tracking-widest text-accent-gold font-light uppercase mt-1">
                  {cafeSettings.cafeName}
                </span>
              </div>
            </header>

            {/* FLOATING BEVERAGE MOCKUPS */}
            
            {/* Latte cup mockup - Center Right */}
            <motion.div
              className="absolute right-0 md:right-8 top-1/3 w-[150px] sm:w-[180px] md:w-[220px] h-auto pointer-events-none z-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              transition={{
                opacity: { duration: 1 },
                x: { duration: 1 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="relative w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                {/* Ambient glow behind drink */}
                <div className="absolute inset-0 bg-accent-gold/5 rounded-full blur-2xl scale-75" />
                <Image
                  src="/latte_mockup.png"
                  alt="Iced Caramel Latte"
                  width={220}
                  height={260}
                  className="object-contain"
                  style={{ height: 'auto' }}
                  priority
                />
              </div>
            </motion.div>

            {/* Cold Brew cup mockup - Bottom Left */}
            <motion.div
              className="absolute left-0 md:left-6 bottom-8 w-[140px] sm:w-[170px] md:w-[200px] h-auto pointer-events-none z-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
              transition={{
                opacity: { duration: 1 },
                x: { duration: 1 },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
              }}
            >
              <div className="relative w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
                <div className="absolute inset-0 bg-emerald-950/10 rounded-full blur-2xl scale-75" />
                <Image
                  src="/coldbrew_mockup.png"
                  alt="Special Cold Brew"
                  width={200}
                  height={220}
                  className="object-contain animate-pulse-subtle"
                  style={{ height: 'auto' }}
                  priority
                />
              </div>
            </motion.div>

            {/* COLUMNS LIST GRID */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-6 items-start relative z-10 my-4">
              
              {/* LEFT COLUMN: Categories 1 & 2 */}
              <div className="space-y-6 md:space-y-10 pr-0 md:pr-12 max-w-sm w-full">
                {leftCategories.map((category) => {
                  const categoryItems = items.filter(item => item.categoryId === category.id);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="space-y-3">
                      {/* Handwriting Cursive Header */}
                      <h2 className="font-script text-3xl text-accent-gold/90 leading-none">
                        {category.name}
                      </h2>
                      
                      <div className="space-y-2">
                        {categoryItems.map((item) => {
                          const isMatch = matchesSearch(item);
                          const isSearching = searchQuery.trim().length > 0;
                          
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              className={`group cursor-pointer py-1 transition-all duration-300 ${
                                isSearching 
                                  ? isMatch ? 'opacity-100 scale-[1.01]' : 'opacity-20 blur-[0.3px]' 
                                  : 'opacity-100 hover:scale-[1.01]'
                              }`}
                            >
                              <div className="flex items-end justify-between w-full">
                                <span className="text-white text-xs sm:text-[13px] font-light uppercase tracking-wider group-hover:text-accent-gold transition-colors whitespace-nowrap">
                                  {item.name}
                                </span>
                                <div className="flex-grow border-b border-dotted border-white/10 mx-2 mb-1 group-hover:border-accent-gold/30 transition-colors" />
                                <span className="text-accent-gold font-mono text-xs sm:text-[13px] font-light">
                                  ${item.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: Categories 3, 4, 5 */}
              <div className="space-y-6 md:space-y-10 pl-0 md:pl-16 lg:pl-24 max-w-sm w-full ml-auto">
                {rightCategories.map((category) => {
                  const categoryItems = items.filter(item => item.categoryId === category.id);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="space-y-3">
                      {/* Handwriting Cursive Header */}
                      <h2 className="font-script text-3xl text-accent-gold/90 leading-none">
                        {category.name}
                      </h2>
                      
                      <div className="space-y-2">
                        {categoryItems.map((item) => {
                          const isMatch = matchesSearch(item);
                          const isSearching = searchQuery.trim().length > 0;
                          
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              className={`group cursor-pointer py-1 transition-all duration-300 ${
                                isSearching 
                                  ? isMatch ? 'opacity-100 scale-[1.01]' : 'opacity-20 blur-[0.3px]' 
                                  : 'opacity-100 hover:scale-[1.01]'
                              }`}
                            >
                              <div className="flex items-end justify-between w-full">
                                <span className="text-white text-xs sm:text-[13px] font-light uppercase tracking-wider group-hover:text-accent-gold transition-colors whitespace-nowrap">
                                  {item.name}
                                </span>
                                <div className="flex-grow border-b border-dotted border-white/10 mx-2 mb-1 group-hover:border-accent-gold/30 transition-colors" />
                                <span className="text-accent-gold font-mono text-xs sm:text-[13px] font-light">
                                  ${item.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* BOTTOM UTILITY & FOOTER */}
            <footer className="flex flex-col items-center justify-center space-y-4 pt-4 border-t border-white/5 bg-transparent relative z-20">
              
              {/* Minimal Search Trigger Bar */}
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter menu items..."
                  className="w-full bg-[#161616]/40 backdrop-blur-xl border border-white/8 rounded-full py-2 px-8 text-[10px] text-white placeholder-secondary-text/40 focus:outline-none focus:border-accent-gold/30 focus:ring-1 focus:ring-accent-gold/25 transition-all text-center tracking-widest uppercase"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-secondary-text/30">
                  <Search className="w-3 h-3" />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-3 flex items-center text-secondary-text/50 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status note */}
              <div className="flex items-center space-x-2 text-[9px] tracking-widest uppercase font-semibold text-secondary-text/80">
                <span className="relative flex h-1.5 w-1.5">
                  {cafeSettings.status.toLowerCase() === 'open now' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    cafeSettings.status.toLowerCase() === 'open now' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></span>
                </span>
                <span>{cafeSettings.cafeName} &bull; {cafeSettings.status} &bull; {cafeSettings.openingHours}</span>
              </div>
            </footer>

          </div>

          {/* DETAILS MODAL FOR ITEM DESCRIPTIONS */}
          <AnimatePresence>
            {selectedItem && (
              <div className="fixed inset-0 flex items-center justify-center p-6 z-50">
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedItem(null)}
                  className="absolute inset-0 bg-black/85 backdrop-blur-md"
                />

                {/* Detail card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-full max-w-sm bg-[#161616]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 space-y-6 relative overflow-hidden z-10"
                >
                  {/* Accent glow in modal */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent-gold/10 rounded-full blur-xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      {selectedItem.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] tracking-[0.15em] uppercase font-bold bg-accent-gold/15 text-accent-gold border border-accent-gold/25 leading-none">
                          {selectedItem.badge}
                        </span>
                      )}
                      <h3 className="text-white text-lg font-light tracking-wide leading-snug">
                        {selectedItem.name}
                      </h3>
                    </div>
                    <span className="text-accent-gold text-xl font-light font-mono leading-none pt-0.5">
                      ${selectedItem.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Body description */}
                  <div className="space-y-1">
                    <span className="text-[8px] tracking-widest text-secondary-text/50 uppercase font-semibold">Gourmet Details</span>
                    <p className="text-secondary-text text-[13px] font-light leading-relaxed">
                      {selectedItem.description || "Crafted to perfection using the finest artisanal ingredients. Ask our barista for customization options."}
                    </p>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="w-full py-2.5 bg-accent-gold hover:bg-accent-gold/90 text-bg-dark rounded-xl text-xs font-semibold tracking-widest uppercase transition-all cursor-pointer"
                  >
                    Return to Menu
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <MenuProvider>
      <MenuContent />
    </MenuProvider>
  );
}
