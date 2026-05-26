import Link from 'next/link';

export function Navbar() {
  return (
    <header className="glass sticky top-0 z-50 w-full shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-center px-[16px] md:px-[40px]">
        {/* Logo — centered */}
        <Link
          href="/"
          className="text-[24px] font-extrabold tracking-[-0.04em] text-ink uppercase transition-transform duration-300 hover:scale-105 md:text-[28px]"
        >
          AMPM
        </Link>
      </div>
    </header>
  );
}
