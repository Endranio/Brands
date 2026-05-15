import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const adminProfilesSchema = pgTable('admin_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  name: text('name'),
  email: text('email'),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const landingContentsSchema = pgTable('landing_contents', {
  id: uuid('id').defaultRandom().primaryKey(),
  heroImageUrl: text('hero_image_url'),
  heroImageKey: text('hero_image_key'),
  heroTitle: text('hero_title'),
  heroSubtitle: text('hero_subtitle'),
  ctaText: text('cta_text'),
  ctaLink: text('cta_link'),
  announcementText: text('announcement_text'),
  instagramUrl: text('instagram_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productsSchema = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: integer('price').notNull(),
  status: text('status').notNull().default('draft'), // draft, active, archived
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productImagesSchema = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => productsSchema.id)
    .notNull(),
  imageUrl: text('image_url').notNull(),
  imageKey: text('image_key').notNull(),
  altText: text('alt_text'),
  isMain: boolean('is_main').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productVariantsSchema = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => productsSchema.id)
    .notNull(),
  size: text('size').notNull(),
  color: text('color'),
  stock: integer('stock').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const ordersSchema = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerAddress: text('customer_address').notNull(),
  status: text('status').notNull().default('pending'), // pending, confirmed, paid, shipped, cancelled
  totalAmount: integer('total_amount').notNull(),
  notes: text('notes'),
  stockCommitted: boolean('stock_committed').default(false),
  stockCommittedAt: timestamp('stock_committed_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const orderItemsSchema = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => ordersSchema.id)
    .notNull(),
  productId: uuid('product_id')
    .references(() => productsSchema.id)
    .notNull(),
  variantId: uuid('variant_id').references(() => productVariantsSchema.id),
  productNameSnapshot: text('product_name_snapshot').notNull(),
  variantSizeSnapshot: text('variant_size_snapshot'),
  variantColorSnapshot: text('variant_color_snapshot'),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: integer('subtotal').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
