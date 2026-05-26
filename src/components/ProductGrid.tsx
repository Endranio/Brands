import { Suspense } from 'react';
import { SearchInput } from './dashboard/SearchInput';
import { ProductCard } from './ProductCard';

type ProductGridProps = {
  locale: string;
  totalProducts?: number;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string | null;
    imageUrl?: string | null;
  }[];
};

export function ProductGrid(props: ProductGridProps) {
  return (
    <section
      id="products"
      className="mx-auto w-full max-w-[1440px] px-[16px] py-[64px] md:px-[40px] md:py-[96px]"
    >
      <div className="mb-[48px] flex flex-col gap-[16px] md:flex-row md:items-end md:justify-between">
        <div className="relative">
          <div className="absolute top-0 bottom-0 -left-[16px] hidden w-[4px] rounded-r-full bg-gradient-to-b from-primary to-[#2020e5] md:block"></div>
          <h2 className="text-heading-xl tracking-[-0.01em] text-ink uppercase">Produk Kami</h2>
          {props.totalProducts !== undefined && props.totalProducts > 0 ? (
            <p className="mt-[8px] text-[14px] text-mute">{props.totalProducts} produk ditemukan</p>
          ) : null}
        </div>
        <Suspense>
          <SearchInput />
        </Suspense>
      </div>

      {props.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-[24px] rounded-[var(--radius-lg)] bg-soft-cloud py-[100px] shadow-inner">
          <div className="animate-fade-in-up rounded-full bg-canvas p-6 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse text-stone"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <p
            className="text-body-strong animate-fade-in-up text-mute"
            style={{ animationDelay: '100ms' }}
          >
            Belum ada produk aktif.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-[16px] gap-y-[48px] md:grid-cols-3 lg:grid-cols-4">
          {props.products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              locale={props.locale}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
      )}
    </section>
  );
}
