CREATE TABLE `email_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(256) NOT NULL,
	`nickname` varchar(128) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`fileCount` int NOT NULL DEFAULT 0,
	`totalFileSize` bigint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `email_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`fileExt` varchar(32) NOT NULL,
	`fileSize` bigint NOT NULL,
	`mimeType` varchar(128),
	`category` varchar(32) NOT NULL,
	`s3Key` varchar(1024) NOT NULL,
	`s3Url` text NOT NULL,
	`shareToken` varchar(64),
	`shareEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_files_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_files_shareToken_unique` UNIQUE(`shareToken`)
);
