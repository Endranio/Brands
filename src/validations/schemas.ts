import type * as z from 'zod';
import { z as zod } from 'zod';

export const landingContentSchema = zod.object({
  heroTitle: zod.string().min(1, 'Hero title is required'),
  heroSubtitle: zod.string().optional(),
  heroImageUrl: zod.string().optional(),
  ctaText: zod.string().min(1, 'CTA text is required'),
  ctaLink: zod.string().min(1, 'CTA link is required'),
  announcementText: zod.string().optional(),
  instagramUrl: zod.string().optional(),
});

export const productSchema = zod.object({
  name: zod.string().min(1, 'Product name is required'),
  slug: zod.string().min(1, 'Slug is required'),
  description: zod.string().optional(),
  price: zod.coerce.number().min(0, 'Price cannot be negative'),
  status: zod.enum(['draft', 'active', 'archived']).default('draft'),
});

export const orderFormSchema = zod.object({
  customerName: zod.string().min(1, 'Nama wajib diisi'),
  customerPhone: zod.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
  customerAddress: zod.string().min(1, 'Alamat wajib diisi'),
  notes: zod.string().optional(),
  productId: zod.uuid({ message: 'Product ID tidak valid' }),
  variantId: zod.uuid({ message: 'Variant ID tidak valid' }).optional(),
  quantity: zod.coerce.number().min(1, 'Jumlah minimal 1'),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const variantSchema = zod.object({
  productId: zod.uuid({ message: 'Product ID tidak valid' }),
  size: zod.string().min(1, 'Ukuran wajib diisi'),
  color: zod.string().optional(),
  stock: zod.coerce.number().min(0, 'Stok tidak boleh negatif'),
  price: zod.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    zod.number().min(0, 'Harga tidak boleh negatif').optional(),
  ),
});

export type VariantFormValues = z.infer<typeof variantSchema>;

export const signInSchema = zod.object({
  email: zod
    .string()
    .min(1, 'Email wajib diisi')
    .regex(/^[^@]+@[^@]+\.[^@]+$/u, 'Format email tidak valid'),
  password: zod.string().min(1, 'Password wajib diisi'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
