'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';

export default function SettingsPage() {
  const { household, user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your household and account</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Household Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Household Name</label>
            <p className="mt-1 font-medium text-gray-900">{household?.name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Your Name</label>
            <p className="mt-1 font-medium text-gray-900">{user?.display_name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <p className="mt-1 font-medium text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Role</label>
            <p className="mt-1 font-medium capitalize text-gray-900">{user?.role}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Household Members</h2>
        <p className="text-sm text-gray-600">Coming soon - invite and manage household members</p>
      </div>
    </div>
  );
}
