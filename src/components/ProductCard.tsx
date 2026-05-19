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
    <Link href={`/${props.locale}/product/${props.slug}`} className="group flex flex-col">
      {/* Image — full-bleed on soft-cloud, no radius, no shadow */}
      <div className="relative aspect-square w-full overflow-hidden bg-soft-cloud">
        {props.imageUrl ? (
          <Image
            src={props.imageUrl}
            alt={props.name}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
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

      {/* Product info — tight spacing per DESIGN.md */}
      <div className="flex flex-col gap-[2px] pt-[12px]">
        <h3 className="text-body-strong leading-snug text-ink">{props.name}</h3>
        <p className="text-body-md mt-[2px] text-ink">{formattedPrice}</p>
      </div>
    </Link>
  );
}
