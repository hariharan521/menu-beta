'use client';

import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-dark text-white flex flex-col md:flex-row selection:bg-accent-gold/20 selection:text-accent-gold antialiased">
      {children}
    </div>
  );
}
