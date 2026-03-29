'use client';

import React, { useState } from 'react';
import { Zap, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { PantryItem } from '@/lib/types';

interface Props {
  items: PantryItem[];
  onLogged: () => void;
}

export default function QuickUsageFAB({ items, onLogged }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [logging, setLogging] = useState<string | null>(null);
  const [logged, setLogged] = useState<string | null>(null);

  // Show the 6 most recently updated items
  const recent = [...items]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  const logUsage = async (item: PantryItem) => {
    if (!user || logging) return;
    setLogging(item.id);
    try {
      await supabase.from('usage_logs').insert([{
        pantry_item_id: item.id,
        quantity_used: 1,
        unit: item.unit,
        logged_by: user.id,
      }]);

      // Decrease quantity in pantry
      await supabase
        .from('pantry_items')
        .update({ quantity: Math.max(0, item.quantity - 1), updated_at: new Date().toISOString() })
        .eq('id', item.id);

      setLogged(item.id);
      setTimeout(() => {
        setLogged(null);
        onLogged();
      }, 1200);
    } finally {
      setLogging(null);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Item quick-buttons */}
      {open && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {recent.map(item => (
            <button
              key={item.id}
              onClick={() => logUsage(item)}
              disabled={!!logging}
              className="flex items-center gap-3 rounded-xl border border-harbour-elevated bg-harbour-surface px-4 py-2.5 shadow-lg
                         cursor-pointer hover:border-brand-500/50 hover:bg-harbour-elevated transition-colors duration-150 text-left"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-harbour-elevated overflow-hidden">
                {item.photo_url
                  ? <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
                  : <span className="text-xs text-harbour-muted">{item.name[0]}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-harbour-text truncate">{item.name}</p>
                <p className="text-xs text-harbour-muted">{item.quantity} {item.unit} left</p>
              </div>
              <div className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10">
                {logging === item.id ? (
                  <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />
                ) : logged === item.id ? (
                  <Check className="w-3 h-3 text-brand-400" />
                ) : (
                  <span className="text-[10px] font-bold text-brand-400">−1</span>
                )}
              </div>
            </button>
          ))}
          <p className="text-center text-xs text-harbour-border">Tap to log 1 unit used</p>
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Quick usage logger"
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-glow
                    cursor-pointer transition-all duration-200
                    ${open
                      ? 'bg-harbour-elevated text-harbour-muted hover:bg-harbour-border'
                      : 'bg-brand-500 text-white hover:bg-brand-600'
                    }`}
      >
        {open ? <X className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
      </button>
    </div>
  );
}
