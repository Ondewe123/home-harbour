'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { Brand, Shop, PantryItem } from '@/lib/types';
import InlineAdd from '@/components/shared/inline-add';

const CATEGORIES = [
  'Grains & Cereals', 'Dairy', 'Meat & Fish', 'Fruits & Vegetables',
  'Beverages', 'Condiments & Sauces', 'Snacks', 'Baking', 'Cleaning', 'Other',
];

const UNITS = ['piece', 'kg', 'g', 'l', 'ml', 'cup', 'tbsp', 'tsp', 'package', 'oz', 'lb'];

export default function EditPantryItemPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user, household } = useAuth();

  const [form, setForm] = useState({
    name: '', category: '', quantity: '1', unit: 'piece',
    brand_id: '', typical_shop_id: '', notes: '',
  });
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!household || !id) return;
    Promise.all([
      supabase.from('pantry_items').select('*').eq('id', id).single(),
      supabase.from('brands').select('*').eq('household_id', household.id).order('name'),
      supabase.from('shops').select('*').eq('household_id', household.id).order('name'),
    ]).then(([itemRes, brandsRes, shopsRes]) => {
      if (itemRes.data) {
        const item = itemRes.data as PantryItem;
        setForm({
          name: item.name,
          category: item.category,
          quantity: String(item.quantity),
          unit: item.unit,
          brand_id: item.brand_id ?? '',
          typical_shop_id: item.typical_shop_id ?? '',
          notes: item.notes ?? '',
        });
        setCurrentPhotoUrl(item.photo_url ?? null);
      }
      if (brandsRes.data) setBrands(brandsRes.data as Brand[]);
      if (shopsRes.data) setShops(shopsRes.data as Shop[]);
      setFetching(false);
    });
  }, [household, id]);

  const update = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const addBrandInline = async (name: string) => {
    if (!household) return;
    const { data } = await supabase.from('brands').insert([{ household_id: household.id, name }]).select().single();
    if (data) {
      const b = data as Brand;
      setBrands(prev => [...prev, b].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(prev => ({ ...prev, brand_id: b.id }));
    }
  };

  const addShopInline = async (name: string) => {
    if (!household) return;
    const { data } = await supabase.from('shops').insert([{ household_id: household.id, name }]).select().single();
    if (data) {
      const s = data as Shop;
      setShops(prev => [...prev, s].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(prev => ({ ...prev, typical_shop_id: s.id }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !household) return;
    setError('');
    setLoading(true);

    try {
      let photo_url = currentPhotoUrl;
      let photo_storage_path: string | null = null;

      if (photo) {
        const ext = photo.name.split('.').pop();
        const path = `${household.id}/items/${id}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('pantry-photos').upload(path, photo, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('pantry-photos').getPublicUrl(path);
        photo_url = urlData.publicUrl;
        photo_storage_path = path;
      }

      const update: Record<string, unknown> = {
        name: form.name,
        category: form.category,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        brand_id: form.brand_id || null,
        typical_shop_id: form.typical_shop_id || null,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      };
      if (photo_url) update.photo_url = photo_url;
      if (photo_storage_path) update.photo_storage_path = photo_storage_path;

      const { error: updateError } = await supabase.from('pantry_items').update(update).eq('id', id);
      if (updateError) throw updateError;
      router.push('/pantry');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-harbour-muted" />
      </div>
    );
  }

  const displayPhoto = photoPreview ?? currentPhotoUrl;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/pantry" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-harbour-text">Edit Item</h1>
          <p className="mt-0.5 text-sm text-harbour-muted">{form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-harbour-text-dim mb-2">Photo</label>
          <div className="flex items-center gap-4">
            {displayPhoto ? (
              <img src={displayPhoto} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-harbour-elevated" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-harbour-elevated text-harbour-border text-xs">
                No photo
              </div>
            )}
            <label className="btn-ghost cursor-pointer text-sm">
              {displayPhoto ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-harbour-text-dim">Item Name *</label>
          <input value={form.name} onChange={update('name')} required className="input-field" />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-harbour-text-dim">Category *</label>
          <select value={form.category} onChange={update('category')} required className="input-field">
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Quantity + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-harbour-text-dim">Quantity *</label>
            <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={update('quantity')} required className="input-field" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-harbour-text-dim">Unit *</label>
            <select value={form.unit} onChange={update('unit')} className="input-field">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Brand */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-harbour-text-dim">Brand</label>
            <InlineAdd placeholder="New brand name" onSave={addBrandInline} />
          </div>
          <select value={form.brand_id} onChange={update('brand_id')} className="input-field">
            <option value="">No brand / Generic</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {/* Shop */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-harbour-text-dim">Usual Shop</label>
            <InlineAdd placeholder="New shop name" onSave={addShopInline} />
          </div>
          <select value={form.typical_shop_id} onChange={update('typical_shop_id')} className="input-field">
            <option value="">Not specified</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-harbour-text-dim">Notes</label>
          <textarea value={form.notes} onChange={update('notes')} rows={2} placeholder="Optional notes..." className="input-field resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
          <Link href="/pantry" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
