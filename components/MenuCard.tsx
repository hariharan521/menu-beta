'use client';

import { motion } from 'framer-motion';
import { MenuItem } from '@/types/menu';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.price);

  const getBadgeColors = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'best seller':
        return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
      case 'chef special':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'new':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'spicy':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      default:
        return 'bg-white/5 text-secondary-text border-white/10';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-[24px] p-6 flex justify-between items-start gap-4"
    >
      <div className="flex flex-col flex-grow">
        {item.badge && (
          <div className="mb-3 flex">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[8px] tracking-[0.2em] uppercase font-semibold border ${getBadgeColors(item.badge)}`}>
              {item.badge}
            </span>
          </div>
        )}

        <h3 className="text-white text-base md:text-lg font-light tracking-wide mb-1.5 leading-snug">
          {item.name}
        </h3>

        <p className="text-secondary-text text-xs md:text-sm font-light leading-relaxed max-w-md">
          {item.description}
        </p>
      </div>

      <div className="text-right flex-shrink-0 pt-0.5">
        <span className="text-accent-gold text-lg md:text-xl font-light font-mono tracking-tight">
          {formattedPrice}
        </span>
      </div>
    </motion.div>
  );
}
