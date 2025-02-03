-- DropForeignKey
ALTER TABLE `Computeur` DROP FOREIGN KEY `Computeur_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Employe` DROP FOREIGN KEY `Employe_userId_fkey`;

-- DropIndex
DROP INDEX `Computeur_userId_fkey` ON `Computeur`;

-- DropIndex
DROP INDEX `Employe_userId_fkey` ON `Employe`;

-- AddForeignKey
ALTER TABLE `Computeur` ADD CONSTRAINT `Computeur_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employe` ADD CONSTRAINT `Employe_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
