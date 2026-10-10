CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_ur` text DEFAULT '' NOT NULL,
	`short_name_en` text DEFAULT '' NOT NULL,
	`short_name_ur` text DEFAULT '' NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`description_ur` text DEFAULT '' NOT NULL,
	`category_en` text DEFAULT 'General' NOT NULL,
	`category_ur` text DEFAULT 'عمومی' NOT NULL,
	`size` text DEFAULT '' NOT NULL,
	`unit_price` integer NOT NULL,
	`stock_quantity` integer DEFAULT 0 NOT NULL,
	`images_json` text DEFAULT '[]' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_products_slug` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_products_active_sort` ON `products` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `store_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`facebook_url` text DEFAULT '' NOT NULL,
	`instagram_url` text DEFAULT '' NOT NULL,
	`youtube_url` text DEFAULT '' NOT NULL,
	`x_url` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
PRAGMA optimize;
