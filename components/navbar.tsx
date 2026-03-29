'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';

export default function Navbar() {
  const { household, user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{household?.name || 'Home Harbour'}</h2>
          <p className="text-sm text-gray-600">{user?.display_name}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
