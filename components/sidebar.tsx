'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/pantry', label: 'Pantry', icon: '📦' },
  { href: '/shopping-lists', label: 'Shopping Lists', icon: '🛒' },
  { href: '/reports', label: 'Reports', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-6">
      <h1 className="mb-8 text-2xl font-bold text-primary-600">🏠 Home Harbour</h1>

      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
