-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_consumer_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_supplier_id_fkey`;

-- DropForeignKey
ALTER TABLE `consumer` DROP FOREIGN KEY `consumer_id_fkey`;

-- DropForeignKey
ALTER TABLE `supplier` DROP FOREIGN KEY `supplier_id_fkey`;

-- AddForeignKey
ALTER TABLE `consumer` ADD CONSTRAINT `FKsvw78kv9yjej2q9pjh5wo77f2` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `FKt7uy0l5oj385g3dixgj2bi9fh` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `FK8anipma7iixckxi1csehosqg3` FOREIGN KEY (`consumer_id`) REFERENCES `consumer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `FKr4fpu25eibjyk6drpilbv05e7` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `bookings` RENAME INDEX `bookings_consumer_id_idx` TO `FK8anipma7iixckxi1csehosqg3`;

-- RenameIndex
ALTER TABLE `bookings` RENAME INDEX `bookings_supplier_id_idx` TO `FKr4fpu25eibjyk6drpilbv05e7`;
