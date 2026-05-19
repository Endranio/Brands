import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { deleteProduct, getProductById, updateProduct } from '@/actions/products';
import { ProductForm } from '@/components/dashboard/ProductForm';

export default async function EditProductPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const mainImage = product.images?.find((img) => img.isMain);

  async function handleUpdate(formData: FormData) {
    'use server';
    return await updateProduct(id, formData);
  }

  async function handleDeleteAction() {
    'use server';
    await deleteProduct(id);
    redirect(`/${locale}/dashboard/products`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col gap-[32px]">
      <div className="flex flex-col gap-[8px] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-heading-xl text-ink">Edit Produk</h1>
          <p className="text-body-md text-mute">Ubah detail produk di bawah ini.</p>
        </div>
        <div className="flex gap-[12px]">
          <Link
            href={`/${locale}/dashboard/products`}
            className="px-[20px] py-[10px] text-[14px] text-mute"
            style={{ border: '1px solid var(--color-hairline-soft)' }}
          >
            Kembali
          </Link>
          <form action={handleDeleteAction}>
            <button
              type="submit"
              className="px-[20px] py-[10px] text-[14px] text-sale"
              style={{ border: '1px solid var(--color-hairline-soft)' }}
            >
              Hapus Produk
            </button>
          </form>
        </div>
      </div>

      <div
        className="bg-canvas p-[32px]"
        style={{ border: '1px solid var(--color-hairline-soft)' }}
      >
        <ProductForm
          mode="edit"
          locale={locale}
          initialData={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            status: product.status,
            mainImageUrl: mainImage?.imageUrl ?? null,
          }}
          onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
}
