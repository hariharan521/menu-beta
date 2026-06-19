'use client';

import { motion } from 'framer-motion';
import { Category, MenuItem } from '@/types/menu';
import MenuCard from './MenuCard';

interface CategorySectionProps {
  category: Category;
  items: MenuItem[];
}

export default function CategorySection({ category, items }: CategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <section 
      id={`category-${category.id}`} 
      className="py-10 scroll-mt-[135px] px-6 md:px-12 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg font-light tracking-[0.25em] text-white uppercase mb-2"
        >
          {category.name}
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-12 h-[1px] bg-accent-gold origin-left"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
