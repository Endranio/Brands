-- Drop legacy boilerplate table
DROP TABLE IF EXISTS "counter";

-- Admin Profiles
CREATE TABLE "admin_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL UNIQUE,
	"name" text,
	"email" text,
	"role" text NOT NULL DEFAULT 'admin',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Landing Contents
CREATE TABLE "landing_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero_image_url" text,
	"hero_image_key" text,
	"hero_title" text,
	"hero_subtitle" text,
	"cta_text" text,
	"cta_link" text,
	"announcement_text" text,
	"instagram_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Products
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text,
	"price" integer NOT NULL,
	"status" text NOT NULL DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Product Images
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL REFERENCES "products"("id"),
	"image_url" text NOT NULL,
	"image_key" text NOT NULL,
	"alt_text" text,
	"is_main" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Product Variants
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL REFERENCES "products"("id"),
	"size" text NOT NULL,
	"color" text,
	"stock" integer NOT NULL DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Orders
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL UNIQUE,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_address" text NOT NULL,
	"status" text NOT NULL DEFAULT 'pending',
	"total_amount" integer NOT NULL,
	"notes" text,
	"stock_committed" boolean DEFAULT false,
	"stock_committed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Order Items
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL REFERENCES "orders"("id"),
	"product_id" uuid NOT NULL REFERENCES "products"("id"),
	"variant_id" uuid REFERENCES "product_variants"("id"),
	"product_name_snapshot" text NOT NULL,
	"variant_size_snapshot" text,
	"variant_color_snapshot" text,
	"price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"subtotal" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Seed: Insert a default landing content row so the landing page works immediately
INSERT INTO "landing_contents" ("hero_title", "hero_subtitle", "cta_text", "cta_link", "is_active")
VALUES ('DISCOVER YOUR STYLE', 'Koleksi terbaru dengan material premium dan desain timeless.', 'Lihat Koleksi', '#products', true);
