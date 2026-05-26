'use client';

import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: 'Konten Landing',
    href: '/dashboard/landing',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    name: 'Produk',
    href: '/dashboard/products',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    name: 'Pesanan',
    href: '/dashboard/orders',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
];

/**
 * Chevron-left double icon (collapse).
 * @returns The SVG icon.
 */
function CollapseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

/**
 * Chevron-right double icon (expand).
 * @returns The SVG icon.
 */
function ExpandIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}

/**
 * Logout icon.
 * @returns The SVG icon.
 */
function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="dashboard-sidebar"
        className="sticky top-0 hidden shrink-0 md:flex"
        style={{
          width: isCollapsed ? 80 : 240,
          height: '100vh',
          flexDirection: 'column',
          borderRight: '1px solid var(--color-hairline)',
          backgroundColor: 'var(--color-canvas)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 60,
            padding: isCollapsed ? '0 12px' : '0 24px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: isCollapsed ? '8px' : '0px',
              width: '100%',
            }}
          >
            {!isCollapsed && (
              <Link
                href="/dashboard"
                className="text-[20px] font-bold tracking-tight text-ink uppercase"
              >
                AMPM Admin
              </Link>
            )}
            <button
              id="sidebar-toggle-btn"
              type="button"
              onClick={() => {
                setIsCollapsed((prev) => !prev);
              }}
              className="flex items-center justify-center rounded-[8px] p-[6px] text-mute transition-colors hover:bg-soft-cloud hover:text-ink"
              title={isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
            >
              {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
            </button>
          </div>
        </div>

        {/* ── Navigation (scrollable, takes remaining space) ── */}
        <nav
          style={{
            flex: '1 1 0%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isCollapsed ? '24px 16px' : '24px 12px',
          }}
        >
          <ul className="flex flex-col gap-[8px]">
            {navItems.map((item) => {
              const isActive = pathname.endsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-[12px] py-[10px] transition-colors ${
                      isCollapsed ? 'justify-center px-0' : 'gap-[12px] px-[12px]'
                    } ${
                      isActive
                        ? 'bg-soft-cloud font-medium text-primary'
                        : 'text-mute hover:bg-soft-cloud/50 hover:text-primary'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="text-[14px] whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer: Logout (always pinned to bottom) ── */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid var(--color-hairline)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: isCollapsed ? 'center' : 'stretch',
          }}
        >
          {/* Logout button */}
          <SignOutButton>
            <button
              id="sidebar-logout-btn"
              type="button"
              className={`flex w-full items-center rounded-[12px] py-[10px] text-mute transition-colors hover:bg-soft-cloud hover:text-ink ${
                isCollapsed ? 'justify-center px-0' : 'gap-[12px] px-[12px]'
              }`}
              title={isCollapsed ? 'Keluar' : undefined}
            >
              <LogoutIcon />
              {!isCollapsed && (
                <span className="text-[14px] font-medium whitespace-nowrap">Keluar</span>
              )}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="pb-safe fixed bottom-0 left-0 z-50 w-full border-t border-hairline bg-canvas md:hidden">
        <ul className="flex h-[60px] items-center justify-around px-[8px]">
          {navItems.map((item) => {
            const isActive = pathname.endsWith(item.href);
            return (
              <li key={item.name} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex h-full flex-col items-center justify-center gap-[4px] px-[4px] ${
                    isActive ? 'text-primary' : 'text-mute'
                  }`}
                >
                  <div className={isActive ? 'scale-110 transition-transform' : ''}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
