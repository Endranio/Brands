'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  page: number;
  totalPages: number;
};

export function Pagination(props: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}#products`);
  }

  if (props.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-[14px] text-mute">
        Halaman {props.page} dari {props.totalPages}
      </p>
      <div className="flex gap-[8px]">
        <button
          type="button"
          disabled={props.page <= 1}
          onClick={() => {
            goToPage(props.page - 1);
          }}
          className="px-[16px] py-[8px] text-[14px] text-ink disabled:opacity-30"
          style={{ border: '1px solid var(--color-hairline-soft)' }}
        >
          Sebelumnya
        </button>
        <button
          type="button"
          disabled={props.page >= props.totalPages}
          onClick={() => {
            goToPage(props.page + 1);
          }}
          className="px-[16px] py-[8px] text-[14px] text-ink disabled:opacity-30"
          style={{ border: '1px solid var(--color-hairline-soft)' }}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
