-- CreateTable
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NULL,
    `role` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consumer` (
    `address` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NULL,
    `id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `company_name` VARCHAR(255) NULL,
    `service_area` VARCHAR(255) NULL,
    `id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `booking_date` VARCHAR(255) NULL,
    `quantity` INTEGER NOT NULL,
    `status` VARCHAR(255) NULL,
    `consumer_id` BIGINT NOT NULL,
    `supplier_id` BIGINT NOT NULL,

    INDEX `bookings_consumer_id_idx`(`consumer_id`),
    INDEX `bookings_supplier_id_idx`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `method` VARCHAR(255) NULL,
    `status` VARCHAR(255) NULL,
    `amount` DOUBLE NULL,
    `consumer_id` BIGINT NOT NULL,
    `supplier_id` BIGINT NOT NULL,
    `booking_id` BIGINT NOT NULL,

    UNIQUE INDEX `payment_booking_id_key`(`booking_id`),
    INDEX `payment_consumer_id_idx`(`consumer_id`),
    INDEX `payment_supplier_id_idx`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rating` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `stars` INTEGER NULL,
    `comment` VARCHAR(500) NULL,
    `consumer_id` BIGINT NOT NULL,
    `supplier_id` BIGINT NOT NULL,

    INDEX `rating_consumer_id_idx`(`consumer_id`),
    INDEX `rating_supplier_id_idx`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_type` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `vehicle_no` VARCHAR(255) NULL,
    `category` VARCHAR(255) NULL,
    `supplier_id` BIGINT NOT NULL,

    UNIQUE INDEX `supplier_type_supplier_id_key`(`supplier_id`),
    INDEX `supplier_type_supplier_id_idx`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `consumer` ADD CONSTRAINT `consumer_id_fkey` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `supplier_id_fkey` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_consumer_id_fkey` FOREIGN KEY (`consumer_id`) REFERENCES `consumer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_consumer_id_fkey` FOREIGN KEY (`consumer_id`) REFERENCES `consumer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_consumer_id_fkey` FOREIGN KEY (`consumer_id`) REFERENCES `consumer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `supplier_type` ADD CONSTRAINT `supplier_type_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
