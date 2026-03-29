'use client';

import React from 'react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-gray-600">View your household consumption and shopping patterns</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Most Used Items</h2>
          <p className="mt-2 text-sm text-gray-600">Coming soon...</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Shopping History</h2>
          <p className="mt-2 text-sm text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
