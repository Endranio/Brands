import { and, desc, eq, isNull, ilike, sql, inArray } from 'drizzle-orm';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Pagination } from '@/components/dashboard/Pagination';
import { HeroSection } from '@/components/HeroSection';
import { ProductGrid } from '@/components/ProductGrid';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { db } from '@/libs/DB';
import { landingContentsSchema, productImagesSchema, productsSchema } from '@/models/Schema';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateMetadata(): Metadata {
  return {
    title: 'AMPM — Clothing Brand',
    description: 'Temukan koleksi terbaru AMPM. Belanja langsung dari website resmi kami.',
  };
}

export default async function IndexPage(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const limit = 20;
  const offset = (page - 1) * limit;

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

  let totalPages = 0;
  let totalProducts = 0;

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
    const conditions = [eq(productsSchema.status, 'active'), isNull(productsSchema.deletedAt)];

    if (q) {
      conditions.push(ilike(productsSchema.name, `%${q}%`));
    }

    const whereClause = and(...conditions);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsSchema)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;
    totalProducts = totalCount;
    totalPages = Math.ceil(totalCount / limit);

    // Get paginated products
    const paginatedProducts = await db
      .select()
      .from(productsSchema)
      .where(whereClause)
      .orderBy(desc(productsSchema.createdAt))
      .limit(limit)
      .offset(offset);

    const productIds = paginatedProducts.map((p) => p.id);

    // Get images for these products
    let productImages: (typeof productImagesSchema.$inferSelect)[] = [];
    if (productIds.length > 0) {
      productImages = await db
        .select()
        .from(productImagesSchema)
        .where(inArray(productImagesSchema.productId, productIds));
    }

    products = paginatedProducts.map((p) => {
      const img =
        productImages.find((i) => i.productId === p.id && i.isMain) ??
        productImages.find((i) => i.productId === p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        description: p.description,
        imageUrl: img?.imageUrl ?? null,
      };
    });
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

      <ProductGrid locale={locale} products={products} totalProducts={totalProducts} />

      {totalPages > 1 && (
        <div className="mx-auto w-full max-w-[1440px] px-[16px] pb-[64px] md:px-[40px] md:pb-[96px]">
          <Suspense>
            <Pagination page={page} totalPages={totalPages} />
          </Suspense>
        </div>
      )}

      <WhatsAppCTA />
    </main>
  );
}
