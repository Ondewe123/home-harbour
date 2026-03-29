'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, X, Loader2 } from 'lucide-react';

interface Props {
  placeholder: string;
  onSave: (value: string) => Promise<void>;
}

export default function InlineAdd({ placeholder, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    await onSave(value.trim());
    setValue('');
    setOpen(false);
    setSaving(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { setOpen(false); setValue(''); }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 cursor-pointer transition-colors"
      >
        <Plus className="w-3 h-3" /> Add new
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="input-field flex-1 py-1.5 text-sm"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !value.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 cursor-pointer transition-colors"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setValue(''); }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-harbour-elevated text-harbour-muted hover:text-harbour-text cursor-pointer transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
