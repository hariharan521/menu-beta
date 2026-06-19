'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/types/menu';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, setActiveCategory }: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeEl = containerRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeCategory]);

  const handleTabClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerOffset = 145; // Height of header + categories tab bar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <motion.div 
      className="sticky top-[69px] z-30 w-full glass-panel py-3 overflow-x-auto no-scrollbar scroll-smooth"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.6 }}
    >
      <div 
        ref={containerRef}
        className="flex space-x-3 px-6 md:px-12 max-w-4xl mx-auto"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              data-active={isActive}
              onClick={() => handleTabClick(category.id)}
              className="relative px-5 py-2 rounded-full text-[10px] tracking-widest uppercase transition-all duration-300 select-none whitespace-nowrap focus:outline-none cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryBg"
                  className="absolute inset-0 bg-accent-gold rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              
              <span 
                className={`relative z-10 font-semibold leading-none tracking-widest ${
                  isActive ? 'text-bg-dark font-bold' : 'text-secondary-text hover:text-white'
                }`}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
