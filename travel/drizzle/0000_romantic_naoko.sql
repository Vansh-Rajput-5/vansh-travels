CREATE TABLE `admin` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_email_unique` ON `admin` (`email`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`pickup` text NOT NULL,
	`drop` text NOT NULL,
	`destination` text NOT NULL,
	`vehicle_type` text NOT NULL,
	`distance` real NOT NULL,
	`price` real NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`payment_id` text,
	`created_at` text NOT NULL
);
