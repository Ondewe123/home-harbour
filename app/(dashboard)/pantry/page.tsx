'use client';

import React from 'react';
import Link from 'next/link';

export default function PantryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pantry Items</h1>
          <p className="mt-1 text-gray-600">Manage your household inventory</p>
        </div>
        <Link
          href="/pantry/add"
          className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
        >
          + Add Item
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">No items yet. Add your first pantry item to get started!</p>
      </div>
    </div>
  );
}
