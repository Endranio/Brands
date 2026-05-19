'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function OrderStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') ?? 'all';

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = e.target;
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-[8px]">
      <label
        htmlFor="order-status-filter"
        className="text-caption-md font-medium whitespace-nowrap text-ink"
      >
        Status:
      </label>
      <select
        id="order-status-filter"
        value={currentStatus}
        onChange={handleStatusChange}
        className="h-[44px] bg-soft-cloud px-[16px] text-[15px] text-ink outline-none focus:ring-2 focus:ring-ink"
      >
        <option value="all">Semua Status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="paid">Paid</option>
        <option value="shipped">Shipped</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
