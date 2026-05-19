import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-canvas" style={{ borderTop: '1px solid var(--color-hairline)' }}>
      <div className="mx-auto max-w-[1440px] px-[16px] pt-[56px] pb-[24px] md:px-[40px]">
        {/* Main footer content */}
        <div className="flex flex-col gap-[40px] md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex max-w-[320px] flex-col gap-[16px]">
            <h3 className="text-[20px] font-extrabold tracking-[-0.04em] text-ink uppercase">
              ANPM
            </h3>
            <p className="text-body-md leading-relaxed text-mute">
              Clothing brand berbasis di Indonesia. Koleksi apparel dengan material premium dan
              desain timeless.
            </p>
            {/* Social */}
            <div className="flex items-center gap-[16px] pt-[4px]">
              <Link
                href="https://instagram.com/anpm.official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[36px] w-[36px] items-center justify-center text-mute transition-colors hover:text-ink"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Link>
              <Link
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[36px] w-[36px] items-center justify-center text-mute transition-colors hover:text-ink"
                aria-label="WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Links columns */}
          <div className="flex gap-[56px] md:gap-[80px]">
            <div className="flex flex-col gap-[14px]">
              <h4 className="text-body-strong text-ink">Bantuan</h4>
              <div className="flex flex-col gap-[10px]">
                <Link
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                  className="text-caption-md text-mute transition-colors hover:text-ink"
                >
                  Hubungi Admin
                </Link>
                <Link
                  href="#"
                  className="text-caption-md text-mute transition-colors hover:text-ink"
                >
                  Cara Pembelian
                </Link>
                <Link
                  href="#"
                  className="text-caption-md text-mute transition-colors hover:text-ink"
                >
                  Pengiriman
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-[14px]">
              <h4 className="text-body-strong text-ink">Brand</h4>
              <div className="flex flex-col gap-[10px]">
                <Link
                  href="/"
                  className="text-caption-md text-mute transition-colors hover:text-ink"
                >
                  Tentang Kami
                </Link>
                <Link
                  href="https://instagram.com/anpm.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption-md text-mute transition-colors hover:text-ink"
                >
                  Instagram
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-[48px] flex flex-col gap-[12px] pt-[20px] md:flex-row md:items-center md:justify-between"
          style={{ borderTop: '1px solid var(--color-hairline-soft)' }}
        >
          <p className="text-utility-xs text-mute">
            &copy; {year} ANPM Clothing Brand. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex gap-[20px]">
            <Link href="#" className="text-utility-xs text-mute transition-colors hover:text-ink">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="#" className="text-utility-xs text-mute transition-colors hover:text-ink">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
