ALTER TABLE `orders` ADD `owner_email_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_email_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `email_last_error` text DEFAULT '' NOT NULL;