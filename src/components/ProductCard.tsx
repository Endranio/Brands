import Image from 'next/image';
import Link from 'next/link';

type ProductCardProps = {
  name: string;
  slug: string;
  price: number;
  locale: string;
  imageUrl?: string | null;
};

export function ProductCard(props: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(props.price);

  return (
    <Link
      href={`/${props.locale}/product/${props.slug}`}
      className="group card-elevated flex animate-fade-in-up flex-col"
    >
      {/* Image — rounded top, subtle zoom on hover */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-[var(--radius-lg)] bg-soft-cloud">
        {props.imageUrl ? (
          <Image
            src={props.imageUrl}
            alt={props.name}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-[8px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-stone"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-caption-sm text-stone">Belum ada foto</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-[4px] rounded-b-[var(--radius-lg)] bg-canvas p-[16px]">
        <h3 className="text-body-strong line-clamp-1 leading-snug text-ink">{props.name}</h3>
        <p className="text-body-md font-semibold text-primary">{formattedPrice}</p>
      </div>
    </Link>
  );
}
