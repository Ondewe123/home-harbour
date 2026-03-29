'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Store, Tag, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { Brand, Shop } from '@/lib/types';

export default function SettingsPage() {
  const { household, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [brands, setBrands] = useState<Brand[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [newShop, setNewShop] = useState({ name: '', location: '' });
  const [addingBrand, setAddingBrand] = useState(false);
  const [addingShop, setAddingShop] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!household) return;
    const [brandsRes, shopsRes] = await Promise.all([
      supabase.from('brands').select('*').eq('household_id', household.id).order('name'),
      supabase.from('shops').select('*').eq('household_id', household.id).order('name'),
    ]);
    if (brandsRes.data) setBrands(brandsRes.data as Brand[]);
    if (shopsRes.data) setShops(shopsRes.data as Shop[]);
  }, [household]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !newBrand.trim()) return;
    setAddingBrand(true);
    const { data } = await supabase
      .from('brands')
      .insert([{ household_id: household.id, name: newBrand.trim() }])
      .select()
      .single();
    if (data) setBrands(prev => [...prev, data as Brand].sort((a, b) => a.name.localeCompare(b.name)));
    setNewBrand('');
    setAddingBrand(false);
  };

  const addShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !newShop.name.trim()) return;
    setAddingShop(true);
    const { data } = await supabase
      .from('shops')
      .insert([{ household_id: household.id, name: newShop.name.trim(), location: newShop.location.trim() || null }])
      .select()
      .single();
    if (data) setShops(prev => [...prev, data as Shop].sort((a, b) => a.name.localeCompare(b.name)));
    setNewShop({ name: '', location: '' });
    setAddingShop(false);
  };

  const deleteBrand = async (id: string) => {
    setDeletingId(id);
    await supabase.from('brands').delete().eq('id', id);
    setBrands(prev => prev.filter(b => b.id !== id));
    setDeletingId(null);
  };

  const deleteShop = async (id: string) => {
    setDeletingId(id);
    await supabase.from('shops').delete().eq('id', id);
    setShops(prev => prev.filter(s => s.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-harbour-text">Settings</h1>
        <p className="mt-1 text-sm text-harbour-muted">Manage your household, brands, and shops</p>
      </div>

      {/* Household info */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-harbour-text-dim">
          <Users className="w-4 h-4" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide">Household</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-harbour-muted">Name</p>
            <p className="mt-0.5 font-medium text-harbour-text">{household?.name}</p>
          </div>
          <div>
            <p className="text-harbour-muted">Your name</p>
            <p className="mt-0.5 font-medium text-harbour-text">{user?.display_name}</p>
          </div>
          <div>
            <p className="text-harbour-muted">Email</p>
            <p className="mt-0.5 font-medium text-harbour-text">{user?.email}</p>
          </div>
          <div>
            <p className="text-harbour-muted">Role</p>
            <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              user?.role === 'admin' ? 'bg-brand-500/15 text-brand-400' : 'bg-harbour-elevated text-harbour-muted'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-harbour-text-dim">
          <Tag className="w-4 h-4" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide">Brands</h2>
          <span className="ml-auto text-xs text-harbour-border">{brands.length} saved</span>
        </div>

        {isAdmin && (
          <form onSubmit={addBrand} className="flex gap-2">
            <input
              value={newBrand}
              onChange={e => setNewBrand(e.target.value)}
              placeholder="Brand name (e.g. Brookside)"
              className="input-field flex-1 text-sm"
            />
            <button type="submit" disabled={addingBrand || !newBrand.trim()} className="btn-primary px-3">
              {addingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="space-y-2">
          {brands.length === 0 ? (
            <p className="text-sm text-harbour-border">No brands added yet.</p>
          ) : brands.map(brand => (
            <div key={brand.id} className="flex items-center justify-between rounded-lg bg-harbour-elevated px-3 py-2">
              <span className="text-sm text-harbour-text">{brand.name}</span>
              {isAdmin && (
                <button
                  onClick={() => deleteBrand(brand.id)}
                  disabled={deletingId === brand.id}
                  className="text-harbour-muted hover:text-red-400 cursor-pointer transition-colors"
                >
                  {deletingId === brand.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shops */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-harbour-text-dim">
          <Store className="w-4 h-4" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide">Shops</h2>
          <span className="ml-auto text-xs text-harbour-border">{shops.length} saved</span>
        </div>

        {isAdmin && (
          <form onSubmit={addShop} className="space-y-2">
            <div className="flex gap-2">
              <input
                value={newShop.name}
                onChange={e => setNewShop(p => ({ ...p, name: e.target.value }))}
                placeholder="Shop name (e.g. Carrefour)"
                className="input-field flex-1 text-sm"
              />
              <button type="submit" disabled={addingShop || !newShop.name.trim()} className="btn-primary px-3">
                {addingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
            <input
              value={newShop.location}
              onChange={e => setNewShop(p => ({ ...p, location: e.target.value }))}
              placeholder="Location (optional, e.g. Westlands)"
              className="input-field text-sm"
            />
          </form>
        )}

        <div className="space-y-2">
          {shops.length === 0 ? (
            <p className="text-sm text-harbour-border">No shops added yet.</p>
          ) : shops.map(shop => (
            <div key={shop.id} className="flex items-center justify-between rounded-lg bg-harbour-elevated px-3 py-2">
              <div>
                <p className="text-sm text-harbour-text">{shop.name}</p>
                {shop.location && <p className="text-xs text-harbour-muted">{shop.location}</p>}
              </div>
              {isAdmin && (
                <button
                  onClick={() => deleteShop(shop.id)}
                  disabled={deletingId === shop.id}
                  className="text-harbour-muted hover:text-red-400 cursor-pointer transition-colors"
                >
                  {deletingId === shop.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
