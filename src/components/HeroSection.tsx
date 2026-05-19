import Image from 'next/image';
import Link from 'next/link';

type HeroSectionProps = {
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
};

export function HeroSection(props: HeroSectionProps) {
  // Fallback hero when no content is configured
  if (!props.imageUrl && !props.title) {
    return (
      <section className="relative flex w-full flex-col items-center justify-center bg-soft-cloud py-[120px] md:py-[160px]">
        <h1 className="text-display-campaign text-ink">ANPM</h1>
        <p className="text-heading-lg mt-[16px] text-mute">Koleksi Segera Hadir</p>
      </section>
    );
  }

  // Hero with title only (no image) — styled with ink background
  if (!props.imageUrl && props.title) {
    return (
      <section className="relative flex w-full items-end bg-ink py-[80px] md:py-[120px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[12px] px-[16px] md:px-[40px]">
          <h1 className="text-display-campaign max-w-[800px] text-on-primary">{props.title}</h1>
          {props.subtitle && (
            <p className="text-heading-lg mt-[8px] max-w-[560px] text-stone">{props.subtitle}</p>
          )}
          {props.ctaText && (
            <div className="mt-[24px]">
              <Link href={props.ctaLink ?? '#products'} className="button-outline-on-image">
                {props.ctaText}
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Full hero with background image
  return (
    <section
      className="relative flex w-full items-end overflow-hidden"
      style={{ minHeight: '75vh' }}
    >
      {/* Background Image */}
      {props.imageUrl && (
        <Image
          src={props.imageUrl}
          alt={props.title ?? 'ANPM Campaign'}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 40%, transparent 65%)',
        }}
      />

      {/* Content lockup — anchored bottom-left per DESIGN.md campaign-tile */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[12px] px-[16px] pb-[56px] md:px-[40px] md:pb-[72px]">
        {props.title && (
          <h1 className="text-display-campaign max-w-[800px] text-canvas">{props.title}</h1>
        )}
        {props.subtitle && (
          <p className="text-body-md mt-[4px] max-w-[480px] leading-relaxed text-canvas/80">
            {props.subtitle}
          </p>
        )}
        {props.ctaText && (
          <div className="mt-[24px]">
            <Link href={props.ctaLink ?? '#products'} className="button-outline-on-image">
              {props.ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
