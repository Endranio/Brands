import { ProductCard } from './ProductCard';

type ProductGridProps = {
  locale: string;
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
      <h2 className="text-heading-xl mb-[40px] tracking-[-0.01em] text-ink uppercase">
        Produk Kami
      </h2>

      {props.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-[16px] bg-soft-cloud py-[80px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-stone"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="text-body-md text-mute">Belum ada produk aktif.</p>
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
