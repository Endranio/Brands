import Link from 'next/link';
import * as React from 'react';

/**
 * QuickActionCard component for navigating to sub-pages from the dashboard.
 * @param props - Component props.
 * @returns The QuickActionCard component.
 */
export function QuickActionCard(props: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={props.href}
      className="group flex flex-col gap-[16px] border border-hairline-soft bg-canvas p-[24px] transition-colors hover:border-brand"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-[40px] w-[40px] items-center justify-center border border-hairline-soft bg-soft-cloud text-ink transition-colors group-hover:bg-ink group-hover:text-canvas">
          {props.icon}
        </div>
        <span className="text-brand opacity-0 transition-opacity group-hover:opacity-100">→</span>
      </div>
      <div className="flex flex-col gap-[4px]">
        <h3 className="text-heading-md text-ink">{props.title}</h3>
        <p className="text-caption-md text-mute">{props.description}</p>
      </div>
    </Link>
  );
}
