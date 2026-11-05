CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"recipient_name" text NOT NULL,
	"phone" text NOT NULL,
	"address_line" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"postal_code" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"selected_size" real NOT NULL,
	"selected_color" text NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_quantity_range" CHECK ("quantity" between 1 and 10)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY,
	"order_id" integer NOT NULL,
	"product_id" text,
	"product_name" text NOT NULL,
	"brand" text NOT NULL,
	"product_image" text NOT NULL,
	"selected_size" real NOT NULL,
	"selected_color" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"subtotal" integer NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"user_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"subtotal" integer NOT NULL,
	"shipping_fee" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text NOT NULL,
	"order_status" text NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_total_nonnegative" CHECK ("total" >= 0),
	CONSTRAINT "orders_payment_method_valid" CHECK ("payment_method" in ('cod','simulated_online')),
	CONSTRAINT "orders_payment_status_valid" CHECK ("payment_status" in ('unpaid','paid_simulated','refunded_simulated')),
	CONSTRAINT "orders_status_valid" CHECK ("order_status" in ('placed','packed','shipped','delivered','cancelled'))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"categories" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"was_price" integer,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"available_sizes" real[] DEFAULT '{}'::real[] NOT NULL,
	"available_colors" text[] DEFAULT '{}'::text[] NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"is_best" boolean DEFAULT false NOT NULL,
	"is_trending" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_price_positive" CHECK ("price" > 0),
	CONSTRAINT "products_stock_nonnegative" CHECK ("stock_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY,
	"full_name" text,
	"email" text NOT NULL,
	"phone" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "addresses_user_idx" ON "addresses" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_variant" ON "cart_items" ("user_id","product_id","selected_size","selected_color");--> statement-breakpoint
CREATE INDEX "cart_items_user_idx" ON "cart_items" ("user_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" ("order_id");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" ("brand");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" ("price");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_items_unique" ON "wishlist_items" ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_user_idx" ON "wishlist_items" ("user_id");--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;