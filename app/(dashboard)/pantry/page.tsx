'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Package, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { PantryItem, Brand, Shop } from '@/lib/types';
import QuickUsageFAB from '@/components/pantry/quick-usage-fab';

const CATEGORIES = [
  'All', 'Grains & Cereals', 'Dairy', 'Meat & Fish', 'Fruits & Vegetables',
  'Beverages', 'Condiments & Sauces', 'Snacks', 'Baking', 'Cleaning', 'Other',
];

type ItemWithMeta = PantryItem & { brand?: Brand; shop?: Shop };

export default function PantryPage() {
  const { user, household } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [items, setItems] = useState<ItemWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!household) return;
    const { data } = await supabase
      .from('pantry_items')
      .select('*, brand:brands(id,name), shop:shops(id,name)')
      .eq('household_id', household.id)
      .eq('is_archived', false)
      .order('name');
    if (data) setItems(data as ItemWithMeta[]);
    setLoading(false);
  }, [household]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    setDeleting(id);
    await supabase.from('pantry_items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    setDeleting(null);
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || item.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-harbour-text">Pantry</h1>
          <p className="mt-1 text-sm text-harbour-muted">
            {items.length} {items.length === 1 ? 'item' : 'items'} tracked
          </p>
        </div>
        {isAdmin && (
          <Link href="/pantry/add" className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Item
          </Link>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-harbour-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="input-field pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="input-field pr-8 appearance-none cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-harbour-muted pointer-events-none" />
        </div>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-harbour-surface animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-harbour-elevated mb-4">
            <Package className="w-7 h-7 text-harbour-muted" />
          </div>
          <h3 className="font-heading font-medium text-harbour-text">
            {search || category !== 'All' ? 'No items match your search' : 'Your pantry is empty'}
          </h3>
          <p className="mt-1.5 text-sm text-harbour-muted max-w-xs">
            {search || category !== 'All'
              ? 'Try a different search or category'
              : 'Add your first item to start tracking'}
          </p>
          {!search && category === 'All' && isAdmin && (
            <Link href="/pantry/add" className="btn-primary mt-6">
              <Plus className="w-4 h-4" /> Add your first item
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative rounded-xl border border-harbour-elevated bg-harbour-surface overflow-hidden transition-colors hover:border-harbour-border">
              {/* Photo */}
              <div className="h-36 bg-harbour-elevated flex items-center justify-center">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="w-10 h-10 text-harbour-border" />
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="font-medium text-harbour-text text-sm truncate">{item.name}</p>
                <p className="text-xs text-harbour-muted">{item.quantity} {item.unit}</p>
                {item.brand && <p className="text-xs text-harbour-border truncate">{item.brand.name}</p>}
                <span className="inline-block rounded-full bg-harbour-elevated px-2 py-0.5 text-[10px] text-harbour-muted">
                  {item.category}
                </span>
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                  <Link
                    href={`/pantry/${item.id}/edit`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-harbour-bg/80 text-harbour-muted hover:text-harbour-text cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-harbour-bg/80 text-harbour-muted hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Usage FAB */}
      <QuickUsageFAB items={items} onLogged={fetchItems} />
    </div>
  );
}
