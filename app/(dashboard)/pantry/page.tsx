'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Package, Pencil, Trash2, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { PantryItem, Brand, Shop } from '@/lib/types';
import QuickUsageFAB from '@/components/pantry/quick-usage-fab';

const ALL = 'All';

type ItemWithMeta = PantryItem & { brand?: Brand; shop?: Shop };

function groupByCategory(items: ItemWithMeta[]) {
  return items.reduce<Record<string, ItemWithMeta[]>>((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

export default function PantryPage() {
  const { user, household } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [items, setItems] = useState<ItemWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const categories = [ALL, ...Array.from(new Set(items.map(i => i.category))).sort()];

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === ALL || item.category === category;
    return matchSearch && matchCat;
  });

  const grouped = groupByCategory(filtered);
  const groupKeys = Object.keys(grouped).sort();

  const renderGridCard = (item: ItemWithMeta) => (
    <div key={item.id} className="group relative rounded-xl border border-harbour-elevated bg-harbour-surface overflow-hidden transition-colors hover:border-harbour-border cursor-pointer">
      <div className="h-36 bg-harbour-elevated flex items-center justify-center">
        {item.photo_url
          ? <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
          : <Package className="w-10 h-10 text-harbour-border" />}
      </div>
      <div className="p-3 space-y-1">
        <p className="font-medium text-harbour-text text-sm truncate">{item.name}</p>
        <p className="text-xs text-harbour-muted">{item.quantity} {item.unit}</p>
        {item.brand && <p className="text-xs text-harbour-border truncate">{(item.brand as Brand).name}</p>}
      </div>
      {isAdmin && (
        <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
          <Link href={`/pantry/${item.id}/edit`}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-harbour-bg/80 text-harbour-muted hover:text-harbour-text cursor-pointer">
            <Pencil className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-harbour-bg/80 text-harbour-muted hover:text-red-400 cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  const renderListRow = (item: ItemWithMeta) => (
    <div key={item.id} className="flex items-center gap-4 rounded-lg border border-harbour-elevated bg-harbour-surface px-4 py-3 transition-colors hover:border-harbour-border group">
      <div className="h-10 w-10 shrink-0 rounded-lg bg-harbour-elevated flex items-center justify-center overflow-hidden">
        {item.photo_url
          ? <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
          : <Package className="w-5 h-5 text-harbour-border" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-harbour-text text-sm truncate">{item.name}</p>
        <p className="text-xs text-harbour-muted">
          {item.brand ? `${(item.brand as Brand).name} · ` : ''}{item.quantity} {item.unit}
        </p>
      </div>
      <span className="hidden sm:inline-block shrink-0 rounded-full bg-harbour-elevated px-2 py-0.5 text-[10px] text-harbour-muted">
        {item.category}
      </span>
      {isAdmin && (
        <div className="hidden group-hover:flex gap-1 shrink-0">
          <Link href={`/pantry/${item.id}/edit`}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-harbour-elevated text-harbour-muted hover:text-harbour-text cursor-pointer">
            <Pencil className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-harbour-elevated text-harbour-muted hover:text-red-400 cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

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
            <Plus className="w-4 h-4" /> Add Item
          </Link>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-harbour-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items..." className="input-field pl-9" />
        </div>
        <div className="relative">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="input-field pr-8 appearance-none cursor-pointer">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-harbour-muted pointer-events-none" />
        </div>
        {/* View toggle */}
        <div className="flex rounded-lg border border-harbour-elevated overflow-hidden">
          <button onClick={() => setViewMode('grid')}
            className={`flex h-10 w-10 items-center justify-center cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-brand-500/10 text-brand-400' : 'text-harbour-muted hover:text-harbour-text'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`flex h-10 w-10 items-center justify-center cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-brand-500/10 text-brand-400' : 'text-harbour-muted hover:text-harbour-text'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-harbour-surface animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-harbour-elevated mb-4">
            <Package className="w-7 h-7 text-harbour-muted" />
          </div>
          <h3 className="font-heading font-medium text-harbour-text">
            {search || category !== ALL ? 'No items match' : 'Your pantry is empty'}
          </h3>
          <p className="mt-1.5 text-sm text-harbour-muted max-w-xs">
            {search || category !== ALL ? 'Try a different search or category' : 'Add your first item to start tracking'}
          </p>
          {!search && category === ALL && isAdmin && (
            <Link href="/pantry/add" className="btn-primary mt-6">
              <Plus className="w-4 h-4" /> Add your first item
            </Link>
          )}
        </div>
      ) : (
        /* Grouped by category */
        <div className="space-y-8">
          {groupKeys.map(cat => (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-harbour-muted">{cat}</h2>
                <span className="text-xs text-harbour-border">{grouped[cat].length}</span>
                <div className="flex-1 border-t border-harbour-elevated" />
              </div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {grouped[cat].map(renderGridCard)}
                </div>
              ) : (
                <div className="space-y-2">
                  {grouped[cat].map(renderListRow)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <QuickUsageFAB items={items} onLogged={fetchItems} />
    </div>
  );
}
