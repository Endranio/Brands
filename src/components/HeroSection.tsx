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
      <section className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-soft-cloud to-[#e2e8f0] py-[120px] md:py-[160px]">
        <h1 className="text-display-campaign relative z-10 animate-fade-in-up text-ink">AMPM</h1>
        <p
          className="text-heading-lg relative z-10 mt-[16px] animate-fade-in-up text-mute"
          style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          Koleksi Segera Hadir
        </p>
      </section>
    );
  }

  // Hero with title only (no image) — styled with ink background
  if (!props.imageUrl && props.title) {
    return (
      <section className="relative flex w-full items-end overflow-hidden bg-gradient-to-br from-ink to-charcoal py-[80px] md:py-[120px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[12px] px-[16px] md:px-[40px]">
          <h1 className="text-display-campaign max-w-[800px] animate-fade-in-up text-on-primary">
            {props.title}
          </h1>
          {props.subtitle && (
            <p
              className="text-heading-lg mt-[8px] max-w-[560px] animate-fade-in-up text-stone"
              style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              {props.subtitle}
            </p>
          )}
          {props.ctaText && (
            <div
              className="mt-[32px] animate-fade-in-up"
              style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              <Link href={props.ctaLink ?? '#products'} className="button-primary">
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
      className="group relative flex w-full items-end overflow-hidden"
      style={{ minHeight: '80vh' }}
    >
      {/* Background Image */}
      {props.imageUrl && (
        <Image
          src={props.imageUrl}
          alt={props.title ?? 'AMPM Campaign'}
          fill
          priority
          className="object-cover transition-transform duration-[20s] ease-out group-hover:scale-110"
          sizes="100vw"
        />
      )}

      {/* Modern gradient overlay for text readability + depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,30,0.85) 0%, rgba(0,0,30,0.4) 40%, transparent 70%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/30 to-transparent"></div>

      {/* Content lockup */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[12px] px-[16px] pb-[64px] md:px-[40px] md:pb-[80px]">
        {props.title && (
          <h1 className="text-display-campaign max-w-[800px] animate-fade-in-up text-canvas">
            {props.title}
          </h1>
        )}
        {props.subtitle && (
          <p
            className="text-heading-lg mt-[4px] max-w-[500px] animate-fade-in-up leading-relaxed text-canvas/90"
            style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}
          >
            {props.subtitle}
          </p>
        )}
        {props.ctaText && (
          <div
            className="mt-[32px] animate-fade-in-up"
            style={{ animationDelay: '300ms', opacity: 0, animationFillMode: 'forwards' }}
          >
            <Link href={props.ctaLink ?? '#products'} className="button-primary shadow-xl">
              {props.ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
