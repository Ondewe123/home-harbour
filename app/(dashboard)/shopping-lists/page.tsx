'use client';

import React from 'react';
import Link from 'next/link';

export default function ShoppingListsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Lists</h1>
          <p className="mt-1 text-gray-600">Create and manage your shopping lists</p>
        </div>
        <Link
          href="/shopping-lists/new"
          className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
        >
          + New List
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">No shopping lists yet. Create one or generate from consumption patterns!</p>
      </div>
    </div>
  );
}
