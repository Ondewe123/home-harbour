'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';

export default function PantryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-harbour-text">Pantry</h1>
          <p className="mt-1 text-sm text-harbour-muted">Manage your household inventory</p>
        </div>
        <Link href="/pantry/add" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Item
        </Link>
      </div>

      {/* Empty state */}
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-harbour-elevated mb-4">
          <Package className="w-7 h-7 text-harbour-muted" />
        </div>
        <h3 className="font-heading font-medium text-harbour-text">Your pantry is empty</h3>
        <p className="mt-1.5 text-sm text-harbour-muted max-w-xs">
          Add your first item to start tracking your household inventory
        </p>
        <Link href="/pantry/add" className="btn-primary mt-6">
          <Plus className="w-4 h-4" />
          Add your first item
        </Link>
      </div>
    </div>
  );
}
