'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, Category, MenuData } from '@/types/menu';
import { 
  ArrowUp, ArrowDown, Edit3, Trash2, Plus, Check, X, 
  Smartphone, ShieldCheck, RefreshCw, AlertCircle
} from 'lucide-react';
import MenuCard from './MenuCard';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuEditorProps {
  initialData: MenuData;
  onSave: (data: MenuData) => Promise<boolean>;
}

export default function MenuEditor({ initialData, onSave }: MenuEditorProps) {
  const [data, setData] = useState<MenuData>(initialData);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Modals / Inline Forms State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    badge: ''
  });

  // Status message
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data.categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(data.categories[0].id);
    }
  }, [data.categories, selectedCategoryId]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave(data);
      if (success) {
        showStatus('success', 'Menu Updated Successfully');
      } else {
        showStatus('error', 'Failed to update menu');
      }
    } catch (error) {
      showStatus('error', 'Error occurred while saving menu');
    } finally {
      setIsSaving(false);
    }
  };

  // CATEGORY OPERATIONS
  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    
    if (data.categories.some(c => c.id === newId)) {
      showStatus('error', 'Category ID already exists');
      return;
    }

    const newCat: Category = {
      id: newId,
      name: newCategoryName.trim()
    };

    setData({
      ...data,
      categories: [...data.categories, newCat]
    });
    setNewCategoryName('');
    setIsAddingCategory(false);
    setSelectedCategoryId(newId);
    showStatus('success', 'Category added');
  };

  const deleteCategory = (id: string) => {
    if (data.categories.length <= 1) {
      showStatus('error', 'Must keep at least one category');
      return;
    }
    const filteredCategories = data.categories.filter(c => c.id !== id);
    const filteredItems = data.items.filter(i => i.categoryId !== id);
    
    setData({
      ...data,
      categories: filteredCategories,
      items: filteredItems
    });
    
    if (selectedCategoryId === id) {
      setSelectedCategoryId(filteredCategories[0].id);
    }
    showStatus('success', 'Category and its items deleted');
  };

  const renameCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    const updated = data.categories.map(c => 
      c.id === editingCategory.id ? { ...c, name: editingCategory.name.trim() } : c
    );
    
    setData({ ...data, categories: updated });
    setEditingCategory(null);
    showStatus('success', 'Category renamed');
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.categories.length) return;
    
    const categories = [...data.categories];
    const temp = categories[index];
    categories[index] = categories[targetIndex];
    categories[targetIndex] = temp;
    
    setData({ ...data, categories });
  };

  // ITEM OPERATIONS
  const addItem = () => {
    if (!newItem.name?.trim() || !selectedCategoryId) return;
    
    const createdItem: MenuItem = {
      id: 'item_' + Date.now(),
      categoryId: selectedCategoryId,
      name: newItem.name.trim(),
      description: newItem.description?.trim() || '',
      price: Number(newItem.price) || 0,
      badge: newItem.badge?.trim() || undefined
    };

    setData({
      ...data,
      items: [...data.items, createdItem]
    });
    
    setNewItem({ name: '', description: '', price: 0, badge: '' });
    setIsAddingItem(false);
    showStatus('success', 'Item added successfully');
  };

  const deleteItem = (id: string) => {
    setData({
      ...data,
      items: data.items.filter(i => i.id !== id)
    });
    showStatus('success', 'Item deleted');
  };

  const updateItem = () => {
    if (!editingItem || !editingItem.name.trim()) return;
    
    const updated = data.items.map(i => 
      i.id === editingItem.id ? { 
        ...editingItem,
        price: Number(editingItem.price) || 0,
        badge: editingItem.badge?.trim() || undefined
      } : i
    );
    
    setData({ ...data, items: updated });
    setEditingItem(null);
    showStatus('success', 'Item updated');
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const currentCategoryItems = data.items.filter(i => i.categoryId === selectedCategoryId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= currentCategoryItems.length) return;
    
    const itemA = currentCategoryItems[index];
    const itemB = currentCategoryItems[targetIndex];
    
    // Update global list by swapping positions of itemA and itemB
    const globalItems = [...data.items];
    const indexA = globalItems.findIndex(i => i.id === itemA.id);
    const indexB = globalItems.findIndex(i => i.id === itemB.id);
    
    globalItems[indexA] = itemB;
    globalItems[indexB] = itemA;
    
    setData({ ...data, items: globalItems });
  };

  const currentCategory = data.categories.find(c => c.id === selectedCategoryId);
  const currentCategoryItems = data.items.filter(i => i.categoryId === selectedCategoryId);

  return (
    <div className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Save bar & Status Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl font-light tracking-widest text-white uppercase">Menu Management</h1>
          <p className="text-secondary-text text-xs font-light">Structure categories, manage pricing, and reorder items.</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider bg-accent-gold text-bg-dark hover:bg-accent-gold/90 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Updating...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl mb-6 flex items-center space-x-3 text-xs tracking-wide border ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-300 border-red-500/20'
            }`}
          >
            {status.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor columns */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CATEGORIES MANAGEMENT CARD */}
          <div className="glass-card rounded-[24px] p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-white text-xs font-semibold tracking-widest uppercase">Categories</h2>
              
              {!isAddingCategory ? (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center space-x-1.5 text-accent-gold hover:text-white transition-colors text-[10px] tracking-widest uppercase focus:outline-none cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New Category Name..."
                    className="bg-[#090909] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-secondary-text/50 focus:outline-none focus:border-accent-gold/40"
                  />
                  <button onClick={addCategory} className="p-1.5 text-emerald-400 hover:text-white cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setIsAddingCategory(false)} className="p-1.5 text-red-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>

            {/* Categories list */}
            <div className="flex flex-wrap gap-2.5">
              {data.categories.map((cat, index) => {
                const isSelected = selectedCategoryId === cat.id;
                const isEditing = editingCategory?.id === cat.id;
                
                return (
                  <div
                    key={cat.id}
                    className={`inline-flex items-center rounded-xl border transition-all duration-300 ${
                      isSelected 
                        ? 'bg-accent-gold/10 border-accent-gold/45 text-white' 
                        : 'bg-[#090909]/40 border-white/8 text-secondary-text hover:text-white'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center px-2 py-1 space-x-1">
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="bg-[#090909] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                        />
                        <button onClick={renameCategory} className="p-1 text-emerald-400"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditingCategory(null)} className="p-1 text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className="px-3.5 py-2 text-[10px] tracking-widest uppercase font-semibold cursor-pointer"
                        >
                          {cat.name}
                        </button>
                        
                        <div className="flex items-center border-l border-white/5 pr-1.5 py-1 space-x-0.5">
                          <button
                            onClick={() => moveCategory(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-secondary-text/50 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveCategory(index, 'down')}
                            disabled={index === data.categories.length - 1}
                            className="p-1 text-secondary-text/50 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingCategory(cat)}
                            className="p-1 text-secondary-text/50 hover:text-accent-gold cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            className="p-1 text-secondary-text/50 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ITEMS MANAGEMENT CARD */}
          <div className="glass-card rounded-[24px] p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-secondary-text text-[10px] tracking-widest uppercase font-light">Dishes in:</span>
                <span className="text-white text-xs font-semibold tracking-widest uppercase border-b border-accent-gold/40">
                  {currentCategory?.name || 'Loading'}
                </span>
              </div>

              {!isAddingItem ? (
                <button
                  onClick={() => setIsAddingItem(true)}
                  className="flex items-center space-x-1.5 text-accent-gold hover:text-white transition-colors text-[10px] tracking-widest uppercase focus:outline-none cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Dish</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAddingItem(false)}
                  className="flex items-center space-x-1 text-red-400 hover:text-white transition-colors text-[10px] tracking-widest uppercase focus:outline-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {/* ADD ITEM INLINE FORM */}
            <AnimatePresence>
              {isAddingItem && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border border-white/5 bg-[#090909]/40 rounded-xl p-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-secondary-text uppercase">Dish Name</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g. Lavender Cappuccino"
                        className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-secondary-text/40 focus:outline-none focus:border-accent-gold/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-secondary-text uppercase">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.price || ''}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                        placeholder="9.50"
                        className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-secondary-text/40 focus:outline-none focus:border-accent-gold/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-secondary-text uppercase">Badge (Optional)</label>
                      <select
                        value={newItem.badge || ''}
                        onChange={(e) => setNewItem({ ...newItem, badge: e.target.value })}
                        className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                      >
                        <option value="">None</option>
                        <option value="Best Seller">Best Seller</option>
                        <option value="Chef Special">Chef Special</option>
                        <option value="New">New</option>
                        <option value="Spicy">Spicy</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-secondary-text uppercase">Description</label>
                      <input
                        type="text"
                        value={newItem.description || ''}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="A subtle infusion of organic french lavender and..."
                        className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-secondary-text/40 focus:outline-none focus:border-accent-gold/30"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addItem}
                    className="w-full py-2 bg-accent-gold hover:bg-accent-gold/90 text-bg-dark rounded-lg text-xs font-semibold tracking-wider uppercase cursor-pointer"
                  >
                    Add Dish to {currentCategory?.name}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* EDIT ITEM INLINE FORM */}
            <AnimatePresence>
              {editingItem && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border border-accent-gold/20 bg-accent-gold/5 rounded-xl p-4 space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[9px] tracking-wider text-accent-gold uppercase font-semibold">Editing: {editingItem.name}</span>
                    <button onClick={() => setEditingItem(null)} className="text-secondary-text hover:text-white"><X className="w-3.5 h-3.5" /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-secondary-text uppercase">Dish Name</label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-secondary-text uppercase">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-secondary-text uppercase">Badge</label>
                      <select
                        value={editingItem.badge || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                        className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                      >
                        <option value="">None</option>
                        <option value="Best Seller">Best Seller</option>
                        <option value="Chef Special">Chef Special</option>
                        <option value="New">New</option>
                        <option value="Spicy">Spicy</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] tracking-wider text-secondary-text uppercase">Description</label>
                      <input
                        type="text"
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full bg-[#090909] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent-gold/30"
                      />
                    </div>
                  </div>

                  <button
                    onClick={updateItem}
                    className="w-full py-2 bg-accent-gold hover:bg-accent-gold/90 text-bg-dark rounded-lg text-xs font-semibold tracking-wider uppercase cursor-pointer"
                  >
                    Save Dish Changes
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List of current items */}
            <div className="space-y-3.5">
              {currentCategoryItems.length === 0 ? (
                <div className="text-center py-12 text-secondary-text/50 font-light text-xs uppercase tracking-widest border border-dashed border-white/5 rounded-xl">
                  No items in this category. Click &quot;Add Dish&quot; above to create one.
                </div>
              ) : (
                currentCategoryItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 rounded-2xl bg-[#090909]/40 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-white text-xs font-medium tracking-wide">{item.name}</span>
                        {item.badge && (
                          <span className="text-[7px] tracking-widest font-bold uppercase text-accent-gold px-1.5 py-0.5 bg-accent-gold/10 rounded border border-accent-gold/25">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-secondary-text font-light line-clamp-1">{item.description}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-accent-gold font-mono text-xs font-light">${item.price.toFixed(2)}</span>
                      
                      <div className="flex items-center space-x-1 border-l border-white/5 pl-4">
                        <button
                          onClick={() => moveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-secondary-text hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(idx, 'down')}
                          disabled={idx === currentCategoryItems.length - 1}
                          className="p-1.5 text-secondary-text hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-secondary-text hover:text-accent-gold cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 text-secondary-text hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Mobile Preview Side Panel */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-3.5 mb-6">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-secondary-text flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-accent-gold" />
              Live Preview
            </span>
            <span className="text-[8px] tracking-widest uppercase font-bold text-accent-gold/70 px-2 py-0.5 bg-accent-gold/10 rounded-full border border-accent-gold/15">
              Live Mockup
            </span>
          </div>

          {/* Premium Device Mockup */}
          <div className="w-[300px] h-[600px] bg-[#090909] border-[6px] border-[#1c1c1c] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col no-scrollbar">
            {/* Phone speaker/camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#1c1c1c] rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-black/60 rounded-full mb-1" />
            </div>

            {/* Simulated Live Menu Viewport */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-6 flex flex-col bg-bg-dark">
              
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#090909]/80 backdrop-blur-md z-10 pt-6">
                <div className="flex flex-col">
                  <span className="text-[7px] tracking-[0.25em] text-accent-gold uppercase font-semibold">{data.cafeSettings.logoText}</span>
                  <span className="text-[11px] font-light text-white tracking-widest uppercase">{data.cafeSettings.cafeName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="relative flex h-1.5 w-1.5">
                    {data.cafeSettings.status.toLowerCase() === 'open now' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                      data.cafeSettings.status.toLowerCase() === 'open now' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></span>
                  </span>
                  <span className="text-[8px] font-bold text-white tracking-widest uppercase">{data.cafeSettings.status}</span>
                </div>
              </div>

              {/* Custom search mockup */}
              <div className="p-3">
                <div className="bg-[#161616]/40 border border-white/5 rounded-full p-2 text-left flex items-center space-x-2">
                  <span className="w-3 h-3 bg-white/5 rounded-full" />
                  <span className="text-[9px] text-secondary-text/40 tracking-wider">Search...</span>
                </div>
              </div>

              {/* Category selector mockup */}
              <div className="flex space-x-2 px-3 pb-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                {data.categories.map((c) => {
                  const isSel = selectedCategoryId === c.id;
                  return (
                    <span
                      key={c.id}
                      className={`text-[8px] tracking-wider uppercase font-semibold px-3 py-1 rounded-full border ${
                        isSel 
                          ? 'bg-accent-gold text-bg-dark border-accent-gold' 
                          : 'bg-[#161616]/60 text-secondary-text/80 border-white/5'
                      }`}
                    >
                      {c.name}
                    </span>
                  );
                })}
              </div>

              {/* Filtered items category list */}
              <div className="flex-1 p-3 space-y-4">
                {currentCategory ? (
                  <div className="space-y-3">
                    <div className="border-b border-white/5 pb-1">
                      <span className="text-[10px] tracking-widest text-white uppercase font-light">{currentCategory.name}</span>
                    </div>
                    
                    <div className="space-y-3">
                      {currentCategoryItems.map((item) => (
                        <div key={item.id} className="border border-white/5 bg-[#161616]/30 rounded-2xl p-3 flex justify-between items-start gap-2">
                          <div className="flex-grow space-y-1">
                            {item.badge && (
                              <span className="inline-block text-[6px] tracking-wider font-bold text-accent-gold bg-accent-gold/10 px-1 py-0.2 rounded border border-accent-gold/15">
                                {item.badge}
                              </span>
                            )}
                            <h4 className="text-[10px] text-white font-light tracking-wide">{item.name}</h4>
                            <p className="text-[8px] text-secondary-text font-light leading-relaxed line-clamp-2">{item.description}</p>
                          </div>
                          <span className="text-accent-gold text-[9px] font-mono font-light">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-[9px] text-secondary-text">No category selected.</span>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 text-center border-t border-white/5 space-y-1">
                <span className="text-[8px] text-white tracking-[0.2em] uppercase font-light">Thank You ❤️</span>
                <p className="text-[6px] text-secondary-text/40 font-mono tracking-widest uppercase">Evolo Cafe</p>
              </div>
            </div>
            
            {/* Phone bottom bar */}
            <div className="h-4 bg-[#1c1c1c] w-full flex items-center justify-center">
              <div className="w-20 h-1 bg-black/60 rounded-full mb-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
