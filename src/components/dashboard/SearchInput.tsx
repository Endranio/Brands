'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      params.delete('page');
      router.push(`?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute top-1/2 left-[14px] size-[18px] -translate-y-1/2 text-stone"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="text"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={handleChange}
        placeholder="Cari produk..."
        className="h-[44px] w-full bg-soft-cloud pr-[16px] pl-[42px] text-[15px] text-ink outline-none placeholder:text-stone focus:ring-2 focus:ring-ink md:w-[300px]"
      />
    </div>
  );
}
