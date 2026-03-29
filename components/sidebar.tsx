'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingCart, BarChart2, Settings } from 'lucide-react';

const links = [
  { href: '/pantry',         label: 'Pantry',         Icon: Package },
  { href: '/shopping-lists', label: 'Shopping Lists',  Icon: ShoppingCart },
  { href: '/reports',        label: 'Reports',         Icon: BarChart2 },
  { href: '/settings',       label: 'Settings',        Icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-harbour-elevated bg-harbour-surface">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-harbour-elevated">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
          <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
        <span className="font-heading text-base font-semibold text-harbour-text">Home Harbour</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-harbour-muted hover:bg-harbour-elevated hover:text-harbour-text'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom version tag */}
      <div className="p-4 border-t border-harbour-elevated">
        <p className="text-xs text-harbour-border">v1.0 · Week 1</p>
      </div>
    </aside>
  );
}
