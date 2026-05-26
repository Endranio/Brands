import { SignOutButton } from '@clerk/nextjs';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-[60px] w-full items-center justify-between border-b border-hairline bg-canvas px-[16px] md:hidden">
      <h1 className="text-[18px] font-bold tracking-tight text-ink uppercase">AMPM Admin</h1>

      <SignOutButton>
        <button type="button" className="text-mute hover:text-ink">
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
        </button>
      </SignOutButton>
    </header>
  );
}
