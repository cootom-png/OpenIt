CREATE TABLE `file_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`fileExt` varchar(32) NOT NULL,
	`fileSize` bigint NOT NULL,
	`mimeType` varchar(128),
	`category` varchar(32) NOT NULL,
	`isSupported` boolean NOT NULL DEFAULT true,
	`previewSuccess` boolean,
	`errorMessage` text,
	`userAgent` text,
	`ipAddress` varchar(64),
	`userId` int,
	`userName` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_uploads_id` PRIMARY KEY(`id`)
);
