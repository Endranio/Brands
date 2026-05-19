import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { HeroSection } from '@/components/HeroSection';
import { ProductGrid } from '@/components/ProductGrid';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { db } from '@/libs/DB';
import { landingContentsSchema, productImagesSchema, productsSchema } from '@/models/Schema';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateMetadata(): Metadata {
  return {
    title: 'ANPM — Clothing Brand',
    description: 'Temukan koleksi terbaru ANPM. Belanja langsung dari website resmi kami.',
  };
}

export default async function IndexPage(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Fetch active landing content (gracefully handle missing tables)
  let content;
  let products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string | null;
    imageUrl: string | null;
  }[] = [];

  try {
    const landingContents = await db
      .select()
      .from(landingContentsSchema)
      .where(eq(landingContentsSchema.isActive, true))
      .limit(1);

    [content] = landingContents;
  } catch {
    // Table may not exist yet — render fallback hero
  }

  try {
    const activeProductsRaw = await db
      .select({
        id: productsSchema.id,
        name: productsSchema.name,
        slug: productsSchema.slug,
        price: productsSchema.price,
        description: productsSchema.description,
        imageUrl: productImagesSchema.imageUrl,
      })
      .from(productsSchema)
      .leftJoin(productImagesSchema, eq(productsSchema.id, productImagesSchema.productId))
      .where(eq(productsSchema.status, 'active'))
      .orderBy(desc(productsSchema.createdAt));

    // Deduplicate products (multiple images per product)
    const productMap = new Map<string, (typeof products)[number]>();
    for (const row of activeProductsRaw) {
      if (!productMap.has(row.id)) {
        productMap.set(row.id, {
          id: row.id,
          name: row.name,
          slug: row.slug,
          price: row.price,
          description: row.description,
          imageUrl: row.imageUrl,
        });
      } else if (row.imageUrl) {
        const existing = productMap.get(row.id);
        if (existing) {
          existing.imageUrl ??= row.imageUrl;
        }
      }
    }

    products = [...productMap.values()];
  } catch {
    // Table may not exist yet — render empty product grid
  }

  return (
    <main className="flex w-full flex-col">
      {content?.announcementText && <AnnouncementBar text={content.announcementText} />}

      <HeroSection
        title={content?.heroTitle}
        subtitle={content?.heroSubtitle}
        imageUrl={content?.heroImageUrl}
        ctaText={content?.ctaText}
        ctaLink={content?.ctaLink}
      />

      <ProductGrid locale={locale} products={products} />

      <WhatsAppCTA />
    </main>
  );
}
