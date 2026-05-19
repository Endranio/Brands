import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { createProduct, getProducts } from '@/actions/products';
import { CreateProductModal } from '@/components/dashboard/CreateProductModal';
import { Pagination } from '@/components/dashboard/Pagination';
import { ProductTable } from '@/components/dashboard/ProductTable';
import { SearchInput } from '@/components/dashboard/SearchInput';

export default async function ProductsPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.q === 'string' ? searchParams.q : undefined;

  const result = await getProducts({ page, limit: 10, search });

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-[24px]">
      <div className="flex flex-col gap-[8px] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-heading-xl text-ink">Kelola Produk</h1>
          <p className="text-body-md text-mute">
            Tambah, edit, atau hapus produk dari katalog toko.
          </p>
        </div>
        <CreateProductModal locale={locale} createAction={createProduct} />
      </div>

      <div className="flex flex-col gap-[16px] md:flex-row md:items-center md:justify-between">
        <Suspense>
          <SearchInput />
        </Suspense>
        <p className="text-[14px] text-mute">{result.total} produk ditemukan</p>
      </div>

      <ProductTable products={result.data} locale={locale} />

      <Suspense>
        <Pagination page={result.page} totalPages={result.totalPages} />
      </Suspense>
    </div>
  );
}
