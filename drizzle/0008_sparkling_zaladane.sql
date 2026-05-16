CREATE TABLE `download_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`company` varchar(256) NOT NULL,
	`realName` varchar(128) NOT NULL,
	`message` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `download_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_files` ADD `viewCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_files` ADD `downloadRequestCount` int DEFAULT 0 NOT NULL;