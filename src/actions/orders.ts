'use server';

import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import {
  orderItemsSchema,
  ordersSchema,
  productsSchema,
  productVariantsSchema,
} from '@/models/Schema';
import { orderFormSchema } from '@/validations/schemas';
import type { OrderFormValues } from '@/validations/schemas';

/**
 * Generate a unique order number (format: AMPM-YYYYMMDD-XXXX).
 *
 * @returns A unique order number string
 */
async function generateOrderNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replaceAll('-', '');

  let unique = false;
  let orderNumber = '';

  while (!unique) {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    orderNumber = `AMPM-${dateStr}-${randomCode}`;

    const existing = await db
      .select({ id: ordersSchema.id })
      .from(ordersSchema)
      .where(eq(ordersSchema.orderNumber, orderNumber))
      .limit(1);

    if (existing.length === 0) {
      unique = true;
    }
  }

  return orderNumber;
}

/**
 * Create a new customer order and return redirect WhatsApp link.
 *
 * @param values - The order form details
 * @returns The created order details and WhatsApp redirect link
 */
export async function submitOrder(values: OrderFormValues) {
  const parsed = orderFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Validasi data order gagal.',
    };
  }

  const { customerName, customerPhone, customerAddress, notes, productId, variantId, quantity } =
    parsed.data;

  // Retrieve product and check status
  const productResult = await db
    .select()
    .from(productsSchema)
    .where(and(eq(productsSchema.id, productId), eq(productsSchema.status, 'active')))
    .limit(1);

  if (productResult.length === 0 || !productResult[0]) {
    return { success: false, error: 'Produk tidak ditemukan atau tidak aktif.' };
  }
  const [product] = productResult;

  let variant: typeof productVariantsSchema.$inferSelect | undefined;
  if (variantId) {
    const variantResult = await db
      .select()
      .from(productVariantsSchema)
      .where(
        and(
          eq(productVariantsSchema.id, variantId),
          eq(productVariantsSchema.productId, productId),
        ),
      )
      .limit(1);

    if (variantResult.length === 0 || !variantResult[0]) {
      return { success: false, error: 'Varian produk tidak ditemukan.' };
    }
    const [foundVariant] = variantResult;
    variant = foundVariant;

    if (!variant.isActive) {
      return { success: false, error: 'Varian produk tidak aktif.' };
    }

    if (variant.stock < quantity) {
      return { success: false, error: `Stok tidak mencukupi. Stok saat ini: ${variant.stock}` };
    }
  }

  // Calculate totals
  const totalAmount = product.price * quantity;

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Create order within a transaction
  const orderData = await db.transaction(async (tx) => {
    const [insertedOrder] = await tx
      .insert(ordersSchema)
      .values({
        orderNumber,
        customerName,
        customerPhone,
        customerAddress,
        notes: notes ?? null,
        totalAmount,
        status: 'pending',
      })
      .returning();

    if (!insertedOrder) {
      throw new Error('Gagal menyimpan header order.');
    }

    await tx.insert(orderItemsSchema).values({
      orderId: insertedOrder.id,
      productId,
      variantId: variantId ?? null,
      productNameSnapshot: product.name,
      variantSizeSnapshot: variant?.size ?? null,
      variantColorSnapshot: variant?.color ?? null,
      price: product.price,
      quantity,
      subtotal: totalAmount,
    });

    return insertedOrder;
  });

  // Prepare WhatsApp url
  const whatsappNumber = Env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const cleanedWhatsapp = whatsappNumber.replaceAll(/\D/gu, '');

  const text = `Halo, saya ingin menindaklanjuti pesanan saya:

*No. Pesanan:* ${orderNumber}
*Nama:* ${customerName}
*Produk:* ${product.name}
${variant ? `*Ukuran:* ${variant.size}` : ''}
${variant?.color ? `*Warna:* ${variant.color}` : ''}
*Jumlah:* ${quantity}
*Total Harga:* Rp ${totalAmount.toLocaleString('id-ID')}
*Alamat:* ${customerAddress}
${notes ? `*Catatan:* ${notes}` : ''}`;

  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/${cleanedWhatsapp}?text=${encodedText}`;

  return {
    success: true,
    orderId: orderData.id,
    orderNumber: orderData.orderNumber,
    totalAmount,
    whatsappUrl,
  };
}

type GetOrdersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

/**
 * Fetch orders for admin panel.
 *
 * @param params - Pagination and filter parameters
 * @returns The list of orders and pagination metadata
 */
export async function getOrders(params: GetOrdersParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(ordersSchema.orderNumber, `%${params.search}%`),
        ilike(ordersSchema.customerName, `%${params.search}%`),
        ilike(ordersSchema.customerPhone, `%${params.search}%`),
      ),
    );
  }

  if (params.status && params.status !== 'all') {
    conditions.push(eq(ordersSchema.status, params.status));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(ordersSchema)
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(ordersSchema.createdAt)),
    db.select({ value: count() }).from(ordersSchema).where(whereCondition),
  ]);

  const [firstTotal] = totalResult;
  const total = firstTotal?.value ?? 0;

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Retrieve a specific order by ID along with its items.
 *
 * @param id - The ID of the order to find
 * @returns The detailed order or null if not found
 */
export async function getOrderById(id: string) {
  const result = await db.select().from(ordersSchema).where(eq(ordersSchema.id, id)).limit(1);

  if (result.length === 0 || !result[0]) {
    return null;
  }

  const [order] = result;

  const items = await db.select().from(orderItemsSchema).where(eq(orderItemsSchema.orderId, id));

  return { ...order, items };
}

/**
 * Update order status and manage stock commitment logic.
 *
 * @param orderId - The ID of the order to update
 * @param newStatus - The new status to transition to
 * @returns A success flag or error message
 */
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const orderResult = await db
    .select()
    .from(ordersSchema)
    .where(eq(ordersSchema.id, orderId))
    .limit(1);
  const [order] = orderResult;
  if (!order) {
    return { success: false, error: 'Pesanan tidak ditemukan.' };
  }

  const oldStatus = order.status;

  if (oldStatus === newStatus) {
    return { success: true };
  }

  const items = await db
    .select()
    .from(orderItemsSchema)
    .where(eq(orderItemsSchema.orderId, orderId));

  // Perform updates in a transaction to guarantee stock consistency
  const success = await db
    .transaction(async (tx) => {
      // 1. Commit stock: transition to 'confirmed' (or direct to paid/shipped) from pending/cancelled
      if (!order.stockCommitted && ['confirmed', 'paid', 'shipped'].includes(newStatus)) {
        for (const item of items) {
          if (item.variantId) {
            const [v] = await tx
              .select()
              .from(productVariantsSchema)
              .where(eq(productVariantsSchema.id, item.variantId))
              .limit(1);

            if (!v || v.stock < item.quantity) {
              throw new Error(
                `Stok tidak mencukupi untuk varian ${item.productNameSnapshot} (${item.variantSizeSnapshot ?? ''}).`,
              );
            }

            await tx
              .update(productVariantsSchema)
              .set({ stock: v.stock - item.quantity })
              .where(eq(productVariantsSchema.id, item.variantId));
          }
        }

        await tx
          .update(ordersSchema)
          .set({
            status: newStatus,
            stockCommitted: true,
            stockCommittedAt: new Date(),
          })
          .where(eq(ordersSchema.id, orderId));
      }
      // 2. Release stock: transition from committed to cancelled
      else if (order.stockCommitted && newStatus === 'cancelled') {
        for (const item of items) {
          if (item.variantId) {
            const [v] = await tx
              .select()
              .from(productVariantsSchema)
              .where(eq(productVariantsSchema.id, item.variantId))
              .limit(1);

            if (v) {
              await tx
                .update(productVariantsSchema)
                .set({ stock: v.stock + item.quantity })
                .where(eq(productVariantsSchema.id, item.variantId));
            }
          }
        }

        await tx
          .update(ordersSchema)
          .set({
            status: newStatus,
            stockCommitted: false,
            stockCommittedAt: null,
          })
          .where(eq(ordersSchema.id, orderId));
      }
      // 3. Simple status update (e.g. pending -> cancelled, or paid -> shipped)
      else {
        await tx
          .update(ordersSchema)
          .set({ status: newStatus })
          .where(eq(ordersSchema.id, orderId));
      }

      return true;
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
      return { success: false, error: message };
    });

  if (typeof success === 'object' && !success.success) {
    return success;
  }

  revalidatePath('/dashboard/orders');

  return { success: true };
}
