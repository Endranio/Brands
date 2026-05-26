import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/actions/products';
import { ProductDetail } from '@/components/ProductDetail';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const productData = await getProductBySlug(slug);

  if (!productData) {
    return {
      title: 'Product Not Found',
    };
  }

  const mainImage = productData.images.find((img) => img.isMain) ?? productData.images[0];

  return {
    title: `${productData.name} — AMPM`,
    description: productData.description ?? `Beli ${productData.name} di AMPM Clothing.`,
    openGraph: {
      images: mainImage ? [mainImage.imageUrl] : [],
    },
  };
}

export default async function ProductPage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);

  const productData = await getProductBySlug(slug);

  if (!productData) {
    notFound();
  }

  return (
    <main className="flex w-full flex-col">
      <ProductDetail
        product={{
          id: productData.id,
          name: productData.name,
          slug: productData.slug,
          price: productData.price,
          description: productData.description,
        }}
        images={productData.images}
        variants={productData.variants}
      />
    </main>
  );
}
