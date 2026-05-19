'use client';

import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-[240px] flex-col border-r border-hairline bg-canvas md:flex">
        <div className="flex h-[60px] items-center px-[24px]">
          <Link
            href="/dashboard"
            className="text-[20px] font-bold tracking-tight text-ink uppercase"
          >
            ANPM Admin
          </Link>
        </div>

        <nav className="flex-1 px-[12px] py-[24px]">
          <ul className="flex flex-col gap-[8px]">
            {navItems.map((item) => {
              // Strip locale from pathname for robust matching if needed, but since we're in app/[locale], pathname includes locale.
              // We'll use a simple includes or exact match.
              const isActive = pathname.endsWith(item.href);

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-[12px] rounded-[12px] px-[12px] py-[10px] transition-colors ${
                      isActive
                        ? 'bg-soft-cloud font-medium text-ink'
                        : 'text-mute hover:bg-soft-cloud/50 hover:text-ink'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[14px]">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-hairline p-[16px]">
          <SignOutButton>
            <button
              type="button"
              className="flex w-full items-center gap-[12px] rounded-[12px] px-[12px] py-[10px] text-mute transition-colors hover:bg-soft-cloud hover:text-ink"
            >
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
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="text-[14px] font-medium">Keluar</span>
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
                    isActive ? 'text-ink' : 'text-mute'
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
