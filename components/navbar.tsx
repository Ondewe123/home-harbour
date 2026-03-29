'use client';

import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function Navbar() {
  const { household, user, signOut } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-harbour-elevated bg-harbour-surface px-6">
      <div>
        <h2 className="font-heading text-sm font-semibold text-harbour-text">
          {household?.name ?? 'Home Harbour'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-harbour-elevated">
          <User className="w-3.5 h-3.5 text-harbour-muted" />
          <span className="text-xs font-medium text-harbour-text-dim">{user?.display_name}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            user?.role === 'admin'
              ? 'bg-brand-500/15 text-brand-400'
              : 'bg-harbour-border/30 text-harbour-muted'
          }`}>
            {user?.role}
          </span>
        </div>

        <button
          onClick={signOut}
          aria-label="Sign out"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-harbour-muted
                     cursor-pointer transition-colors duration-150 hover:bg-harbour-elevated hover:text-harbour-text"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </header>
  );
}
