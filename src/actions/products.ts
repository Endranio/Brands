'use server';

import { and, count, desc, eq, ilike, isNull, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { deleteFromImageKit, uploadToImageKit } from '@/libs/ImageKit';
import {
  orderItemsSchema,
  productImagesSchema,
  productsSchema,
  productVariantsSchema,
} from '@/models/Schema';
import { variantSchema } from '@/validations/schemas';
import type { VariantFormValues } from '@/validations/schemas';

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

  const baseCondition = isNull(productsSchema.deletedAt);
  const searchCondition = params.search
    ? and(
        baseCondition,
        or(
          ilike(productsSchema.name, `%${params.search}%`),
          ilike(productsSchema.slug, `%${params.search}%`),
        ),
      )
    : baseCondition;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(productsSchema)
      .where(searchCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(productsSchema.createdAt)),
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
  const result = await db
    .select()
    .from(productsSchema)
    .where(and(eq(productsSchema.id, id), isNull(productsSchema.deletedAt)))
    .limit(1);

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
    .where(
      and(
        eq(productsSchema.slug, slug),
        eq(productsSchema.status, 'active'),
        isNull(productsSchema.deletedAt),
      ),
    )
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
  const productImages = formData.getAll('productImages');

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

  // Handle product images upload
  const validFiles = productImages.filter((f): f is File => f instanceof File && f.size > 0);
  if (productId && validFiles.length > 0) {
    const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

    for (let i = 0; i < validFiles.length; i += 1) {
      const file = validFiles[i];
      if (!file || !allowedTypes.has(file.type)) {
        continue;
      }
      const buffer = await file.arrayBuffer();
      const result = await uploadToImageKit(buffer, file.name, '/products');

      await db.insert(productImagesSchema).values({
        productId,
        imageUrl: result.url,
        imageKey: result.fileId,
        isMain: i === 0,
        sortOrder: i,
      });
    }
  }

  revalidatePath('/dashboard/products');

  return { success: true, id: productId };
}

// eslint-disable-next-line complexity
export async function updateProduct(id: string, formData: FormData) {
  const name = getStr(formData, 'name');
  const slug = getStr(formData, 'slug') || slugify(name);
  const description = getStr(formData, 'description');
  const priceStr = getStr(formData, 'price') || '0';
  const status = getStr(formData, 'status') || 'draft';
  const productImages = formData.getAll('productImages');

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

  const keptImageIdsStr = formData.get('keptImageIds');
  let keptImageIds: string[] = [];
  if (typeof keptImageIdsStr === 'string') {
    try {
      const parsed = JSON.parse(keptImageIdsStr) as unknown;
      if (Array.isArray(parsed)) {
        keptImageIds = parsed.map(String);
      }
    } catch {
      // ignore JSON parse error
    }
  }

  // Delete old images not in keptImageIds
  const oldImages = await db
    .select()
    .from(productImagesSchema)
    .where(eq(productImagesSchema.productId, id));

  const imagesToDelete = oldImages.filter((img) => !keptImageIds.includes(img.id));

  for (const img of imagesToDelete) {
    if (img.imageKey) {
      try {
        await deleteFromImageKit(img.imageKey);
      } catch {
        // Ignore deletion errors
      }
    }
    await db.delete(productImagesSchema).where(eq(productImagesSchema.id, img.id));
  }

  const remainingImages = oldImages.filter((img) => keptImageIds.includes(img.id));
  let hasMain = remainingImages.some((img) => img.isMain);
  let maxSortOrder = -1;
  for (const img of remainingImages) {
    maxSortOrder = Math.max(maxSortOrder, img.sortOrder ?? 0);
  }

  if (remainingImages.length > 0 && !hasMain) {
    const firstId = remainingImages[0]?.id;
    if (firstId) {
      await db
        .update(productImagesSchema)
        .set({ isMain: true })
        .where(eq(productImagesSchema.id, firstId));
      hasMain = true;
    }
  }

  // Handle new images upload
  const validFiles = productImages.filter((f): f is File => f instanceof File && f.size > 0);
  if (validFiles.length > 0) {
    const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

    for (let i = 0; i < validFiles.length; i += 1) {
      const file = validFiles[i];
      if (file && allowedTypes.has(file.type)) {
        const buffer = await file.arrayBuffer();
        const result = await uploadToImageKit(buffer, file.name, '/products');

        await db.insert(productImagesSchema).values({
          productId: id,
          imageUrl: result.url,
          imageKey: result.fileId,
          isMain: !hasMain && i === 0,
          sortOrder: maxSortOrder + 1 + i,
        });
      }
    }
  }

  revalidatePath('/dashboard/products');

  return { success: true };
}

export async function deleteProduct(id: string) {
  // Check if product exists and has orders
  const orders = await db
    .select({ id: orderItemsSchema.id })
    .from(orderItemsSchema)
    .where(eq(orderItemsSchema.productId, id))
    .limit(1);

  if (orders.length > 0) {
    // Soft delete
    await db.update(productsSchema).set({ deletedAt: new Date() }).where(eq(productsSchema.id, id));
  } else {
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

    // Delete variants
    await db.delete(productVariantsSchema).where(eq(productVariantsSchema.productId, id));

    // Delete images from DB
    await db.delete(productImagesSchema).where(eq(productImagesSchema.productId, id));

    // Delete product
    await db.delete(productsSchema).where(eq(productsSchema.id, id));
  }

  revalidatePath('/dashboard/products');

  return { success: true };
}

export async function getVariantsByProductId(productId: string) {
  const variants = await db
    .select()
    .from(productVariantsSchema)
    .where(eq(productVariantsSchema.productId, productId))
    .orderBy(productVariantsSchema.createdAt);

  return variants;
}

export async function addVariant(data: VariantFormValues) {
  const parsed = variantSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' };
  }

  await db.insert(productVariantsSchema).values({
    productId: parsed.data.productId,
    size: parsed.data.size,
    color: parsed.data.color,
    stock: parsed.data.stock,
    price: parsed.data.price,
    isActive: true,
  });

  revalidatePath('/dashboard/products');
  return { success: true };
}

export async function updateVariant(id: string, data: VariantFormValues) {
  const parsed = variantSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' };
  }

  await db
    .update(productVariantsSchema)
    .set({
      size: parsed.data.size,
      color: parsed.data.color,
      stock: parsed.data.stock,
      price: parsed.data.price,
    })
    .where(eq(productVariantsSchema.id, id));

  revalidatePath('/dashboard/products');
  return { success: true };
}

export async function deleteVariant(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if variant is referenced in order_items
    const referenced = await db
      .select({ id: orderItemsSchema.id })
      .from(orderItemsSchema)
      .where(eq(orderItemsSchema.variantId, id))
      .limit(1);

    const query =
      referenced.length > 0
        ? db
            .update(productVariantsSchema)
            .set({ isActive: false })
            .where(eq(productVariantsSchema.id, id))
        : db.delete(productVariantsSchema).where(eq(productVariantsSchema.id, id));

    await query;

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus varian';
    return { success: false, error: errorMessage };
  }
}
