'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Store, Tag, Users, Loader2, Pencil, Check, X, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { Brand, Shop, User } from '@/lib/types';

export default function SettingsPage() {
  const { household, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [brands, setBrands] = useState<Brand[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [newShop, setNewShop] = useState({ name: '', location: '' });
  const [newMember, setNewMember] = useState({ displayName: '', email: '', password: '', role: 'user' });
  const [addingBrand, setAddingBrand] = useState(false);
  const [addingShop, setAddingShop] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [memberError, setMemberError] = useState('');

  // Household edit state
  const [editingHousehold, setEditingHousehold] = useState(false);
  const [hhName, setHhName] = useState('');
  const [myName, setMyName] = useState('');
  const [savingHousehold, setSavingHousehold] = useState(false);

  const fetchData = useCallback(async () => {
    if (!household) return;
    const [brandsRes, shopsRes, membersRes] = await Promise.all([
      supabase.from('brands').select('*').eq('household_id', household.id).order('name'),
      supabase.from('shops').select('*').eq('household_id', household.id).order('name'),
      supabase.from('users').select('*').eq('household_id', household.id).order('display_name'),
    ]);
    if (brandsRes.data) setBrands(brandsRes.data as Brand[]);
    if (shopsRes.data) setShops(shopsRes.data as Shop[]);
    if (membersRes.data) setMembers(membersRes.data as User[]);
  }, [household]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startEditHousehold = () => {
    setHhName(household?.name ?? '');
    setMyName(user?.display_name ?? '');
    setEditingHousehold(true);
  };

  const saveHousehold = async () => {
    if (!household) return;
    setSavingHousehold(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/household/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ householdName: hhName, displayName: myName, householdId: household.id }),
      });
      setEditingHousehold(false);
      window.location.reload(); // refresh auth context
    } finally {
      setSavingHousehold(false);
    }
  };

  const addBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !newBrand.trim()) return;
    setAddingBrand(true);
    const { data } = await supabase
      .from('brands').insert([{ household_id: household.id, name: newBrand.trim() }]).select().single();
    if (data) setBrands(prev => [...prev, data as Brand].sort((a, b) => a.name.localeCompare(b.name)));
    setNewBrand('');
    setAddingBrand(false);
  };

  const addShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !newShop.name.trim()) return;
    setAddingShop(true);
    const { data } = await supabase
      .from('shops').insert([{ household_id: household.id, name: newShop.name.trim(), location: newShop.location.trim() || null }]).select().single();
    if (data) setShops(prev => [...prev, data as Shop].sort((a, b) => a.name.localeCompare(b.name)));
    setNewShop({ name: '', location: '' });
    setAddingShop(false);
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;
    setMemberError('');
    setAddingMember(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/household/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ...newMember, householdId: household.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewMember({ displayName: '', email: '', password: '', role: 'user' });
      setShowMemberForm(false);
      fetchData();
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
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
        <p className="mt-1 text-sm text-harbour-muted">Manage your household, brands, shops and members</p>
      </div>

      {/* Household info */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-harbour-text-dim" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-harbour-text-dim">Household</h2>
          {isAdmin && !editingHousehold && (
            <button onClick={startEditHousehold} className="ml-auto btn-ghost py-1 px-2 text-xs gap-1">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
        </div>

        {editingHousehold ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-harbour-muted">Household Name</label>
              <input value={hhName} onChange={e => setHhName(e.target.value)} className="input-field text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-harbour-muted">Your Display Name</label>
              <input value={myName} onChange={e => setMyName(e.target.value)} className="input-field text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={saveHousehold} disabled={savingHousehold} className="btn-primary text-sm py-1.5 px-3">
                {savingHousehold ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </button>
              <button onClick={() => setEditingHousehold(false)} className="btn-ghost text-sm py-1.5 px-3">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-harbour-muted">Household</p>
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
        )}
      </div>

      {/* Members */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-harbour-text-dim" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-harbour-text-dim">Members</h2>
          <span className="ml-auto text-xs text-harbour-border">{members.length} member{members.length !== 1 ? 's' : ''}</span>
          {isAdmin && (
            <button onClick={() => setShowMemberForm(o => !o)} className="btn-ghost py-1 px-2 text-xs gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          )}
        </div>

        {showMemberForm && isAdmin && (
          <form onSubmit={addMember} className="space-y-3 rounded-lg border border-harbour-elevated p-4">
            <p className="text-xs font-medium text-harbour-muted uppercase tracking-wide">New Member</p>
            {memberError && (
              <p className="text-xs text-red-400">{memberError}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-harbour-muted">Display Name</label>
                <input value={newMember.displayName} onChange={e => setNewMember(p => ({ ...p, displayName: e.target.value }))}
                  placeholder="Jane Smith" required className="input-field text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-harbour-muted">Role</label>
                <select value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} className="input-field text-sm">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-harbour-muted">Email</label>
              <input type="email" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))}
                placeholder="jane@example.com" required className="input-field text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-harbour-muted">Temporary Password</label>
              <input type="password" value={newMember.password} onChange={e => setNewMember(p => ({ ...p, password: e.target.value }))}
                placeholder="They can change this later" required minLength={6} className="input-field text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={addingMember} className="btn-primary text-sm py-1.5 px-3">
                {addingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                Add Member
              </button>
              <button type="button" onClick={() => setShowMemberForm(false)} className="btn-ghost text-sm py-1.5 px-3">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg bg-harbour-elevated px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-harbour-border text-sm font-semibold text-harbour-text">
                {m.display_name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-harbour-text truncate">{m.display_name}</p>
                <p className="text-xs text-harbour-muted truncate">{m.email}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                m.role === 'admin' ? 'bg-brand-500/15 text-brand-400' : 'bg-harbour-surface text-harbour-muted'
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-harbour-text-dim" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-harbour-text-dim">Brands</h2>
          <span className="ml-auto text-xs text-harbour-border">{brands.length} saved</span>
        </div>
        {isAdmin && (
          <form onSubmit={addBrand} className="flex gap-2">
            <input value={newBrand} onChange={e => setNewBrand(e.target.value)}
              placeholder="e.g. Brookside" className="input-field flex-1 text-sm" />
            <button type="submit" disabled={addingBrand || !newBrand.trim()} className="btn-primary px-3">
              {addingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </form>
        )}
        <div className="space-y-2">
          {brands.length === 0
            ? <p className="text-sm text-harbour-border">No brands added yet.</p>
            : brands.map(brand => (
              <div key={brand.id} className="flex items-center justify-between rounded-lg bg-harbour-elevated px-3 py-2">
                <span className="text-sm text-harbour-text">{brand.name}</span>
                {isAdmin && (
                  <button onClick={() => deleteBrand(brand.id)} disabled={deletingId === brand.id}
                    className="text-harbour-muted hover:text-red-400 cursor-pointer transition-colors">
                    {deletingId === brand.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Shops */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-harbour-text-dim" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-harbour-text-dim">Shops</h2>
          <span className="ml-auto text-xs text-harbour-border">{shops.length} saved</span>
        </div>
        {isAdmin && (
          <form onSubmit={addShop} className="space-y-2">
            <div className="flex gap-2">
              <input value={newShop.name} onChange={e => setNewShop(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Carrefour" className="input-field flex-1 text-sm" />
              <button type="submit" disabled={addingShop || !newShop.name.trim()} className="btn-primary px-3">
                {addingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
            <input value={newShop.location} onChange={e => setNewShop(p => ({ ...p, location: e.target.value }))}
              placeholder="Location (optional, e.g. Westlands)" className="input-field text-sm" />
          </form>
        )}
        <div className="space-y-2">
          {shops.length === 0
            ? <p className="text-sm text-harbour-border">No shops added yet.</p>
            : shops.map(shop => (
              <div key={shop.id} className="flex items-center justify-between rounded-lg bg-harbour-elevated px-3 py-2">
                <div>
                  <p className="text-sm text-harbour-text">{shop.name}</p>
                  {shop.location && <p className="text-xs text-harbour-muted">{shop.location}</p>}
                </div>
                {isAdmin && (
                  <button onClick={() => deleteShop(shop.id)} disabled={deletingId === shop.id}
                    className="text-harbour-muted hover:text-red-400 cursor-pointer transition-colors">
                    {deletingId === shop.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
