import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { getOrders } from '@/actions/orders';
import { OrderStatusFilter } from '@/components/dashboard/OrderStatusFilter';
import { OrderTable } from '@/components/dashboard/OrderTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { SearchInput } from '@/components/dashboard/SearchInput';

export default async function OrdersPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const result = await getOrders({ page, limit: 10, search, status });

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-[24px]">
      <div className="flex flex-col gap-[8px]">
        <h1 className="text-heading-xl text-ink">Pesanan Masuk</h1>
        <p className="text-body-md text-mute">
          Pantau, konfirmasi, dan kelola pesanan dari pelanggan.
        </p>
      </div>

      <div className="flex flex-col gap-[16px] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-[12px] md:flex-row md:items-center">
          <Suspense>
            <SearchInput />
          </Suspense>
          <Suspense>
            <OrderStatusFilter />
          </Suspense>
        </div>
        <p className="text-[14px] text-mute">{result.total} pesanan ditemukan</p>
      </div>

      <OrderTable orders={result.data} locale={locale} />

      <Suspense>
        <Pagination page={result.page} totalPages={result.totalPages} />
      </Suspense>
    </div>
  );
}
