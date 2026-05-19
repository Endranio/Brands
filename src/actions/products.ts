'use server';

import { and, count, eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { deleteFromImageKit, uploadToImageKit } from '@/libs/ImageKit';
import { productImagesSchema, productsSchema, productVariantsSchema } from '@/models/Schema';

/**
 * Safely extract a string value from FormData.
 *
 * @param formData - The FormData object
 * @param key - The key to extract
 * @returns The string value or empty string
 */
function getStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

type GetProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getProducts(params: GetProductsParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  const searchCondition = params.search
    ? or(
        ilike(productsSchema.name, `%${params.search}%`),
        ilike(productsSchema.slug, `%${params.search}%`),
      )
    : undefined;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(productsSchema)
      .where(searchCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(productsSchema.createdAt),
    db.select({ value: count() }).from(productsSchema).where(searchCondition),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductById(id: string) {
  const result = await db.select().from(productsSchema).where(eq(productsSchema.id, id)).limit(1);

  if (result.length === 0) {
    return null;
  }

  const images = await db
    .select()
    .from(productImagesSchema)
    .where(eq(productImagesSchema.productId, id))
    .orderBy(productImagesSchema.sortOrder);

  return { ...result[0], images };
}

export async function getProductBySlug(slug: string) {
  const result = await db
    .select()
    .from(productsSchema)
    .where(and(eq(productsSchema.slug, slug), eq(productsSchema.status, 'active')))
    .limit(1);

  if (result.length === 0 || !result[0]) {
    return null;
  }

  const [product] = result;

  const images = await db
    .select()
    .from(productImagesSchema)
    .where(eq(productImagesSchema.productId, product.id))
    .orderBy(productImagesSchema.sortOrder);

  const variants = await db
    .select()
    .from(productVariantsSchema)
    .where(
      and(
        eq(productVariantsSchema.productId, product.id),
        eq(productVariantsSchema.isActive, true),
      ),
    );

  return { ...product, images, variants };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^\w\s-]/gu, '')
    .replaceAll(/[\s_]+/gu, '-')
    .replaceAll(/^-+|-+$/gu, '');
}

export async function createProduct(formData: FormData) {
  const name = getStr(formData, 'name');
  const slug = getStr(formData, 'slug') || slugify(name);
  const description = getStr(formData, 'description');
  const priceStr = getStr(formData, 'price') || '0';
  const status = getStr(formData, 'status') || 'draft';
  const productImage = formData.get('productImage');

  if (!name) {
    return { success: false, error: 'Nama produk harus diisi.' };
  }

  const price = Number.parseInt(priceStr, 10);
  if (Number.isNaN(price) || price < 0) {
    return { success: false, error: 'Harga tidak valid.' };
  }

  // Check slug uniqueness
  const existing = await db
    .select({ id: productsSchema.id })
    .from(productsSchema)
    .where(eq(productsSchema.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: 'Slug sudah digunakan produk lain.' };
  }

  const inserted = await db
    .insert(productsSchema)
    .values({ name, slug, description, price, status })
    .returning({ id: productsSchema.id });

  const productId = inserted[0]?.id;

  // Handle product image upload
  if (productId && productImage instanceof File && productImage.size > 0) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(productImage.type)) {
      return {
        success: true,
        id: productId,
        warning: 'Produk dibuat, tapi format gambar tidak valid.',
      };
    }

    const buffer = await productImage.arrayBuffer();
    const result = await uploadToImageKit(buffer, productImage.name, '/products');

    await db.insert(productImagesSchema).values({
      productId,
      imageUrl: result.url,
      imageKey: result.fileId,
      isMain: true,
      sortOrder: 0,
    });
  }

  revalidatePath('/dashboard/products');

  return { success: true, id: productId };
}

export async function updateProduct(id: string, formData: FormData) {
  const name = getStr(formData, 'name');
  const slug = getStr(formData, 'slug') || slugify(name);
  const description = getStr(formData, 'description');
  const priceStr = getStr(formData, 'price') || '0';
  const status = getStr(formData, 'status') || 'draft';
  const productImage = formData.get('productImage');

  if (!name) {
    return { success: false, error: 'Nama produk harus diisi.' };
  }

  const price = Number.parseInt(priceStr, 10);
  if (Number.isNaN(price) || price < 0) {
    return { success: false, error: 'Harga tidak valid.' };
  }

  // Check slug uniqueness (exclude current product)
  const existing = await db
    .select({ id: productsSchema.id })
    .from(productsSchema)
    .where(eq(productsSchema.slug, slug))
    .limit(1);

  if (existing.length > 0 && existing[0]?.id !== id) {
    return { success: false, error: 'Slug sudah digunakan produk lain.' };
  }

  await db
    .update(productsSchema)
    .set({ name, slug, description, price, status })
    .where(eq(productsSchema.id, id));

  // Handle product image upload
  if (productImage instanceof File && productImage.size > 0) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(productImage.type)) {
      // Delete old main image if exists
      const oldImages = await db
        .select()
        .from(productImagesSchema)
        .where(and(eq(productImagesSchema.productId, id), eq(productImagesSchema.isMain, true)))
        .limit(1);

      if (oldImages[0]?.imageKey) {
        try {
          await deleteFromImageKit(oldImages[0].imageKey);
        } catch {
          // Ignore deletion errors
        }
        await db.delete(productImagesSchema).where(eq(productImagesSchema.id, oldImages[0].id));
      }

      const buffer = await productImage.arrayBuffer();
      const result = await uploadToImageKit(buffer, productImage.name, '/products');

      await db.insert(productImagesSchema).values({
        productId: id,
        imageUrl: result.url,
        imageKey: result.fileId,
        isMain: true,
        sortOrder: 0,
      });
    }
  }

  revalidatePath('/dashboard/products');

  return { success: true };
}

export async function deleteProduct(id: string) {
  // Delete associated images from ImageKit
  const images = await db
    .select()
    .from(productImagesSchema)
    .where(eq(productImagesSchema.productId, id));

  for (const image of images) {
    if (image.imageKey) {
      try {
        await deleteFromImageKit(image.imageKey);
      } catch {
        // Ignore deletion errors
      }
    }
  }

  // Delete images from DB
  await db.delete(productImagesSchema).where(eq(productImagesSchema.productId, id));

  // Delete product
  await db.delete(productsSchema).where(eq(productsSchema.id, id));

  revalidatePath('/dashboard/products');

  return { success: true };
}
