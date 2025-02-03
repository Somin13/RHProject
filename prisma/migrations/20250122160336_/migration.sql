/*
  Warnings:

  - Added the required column `userId` to the `Computeur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Computeur` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Computeur` ADD CONSTRAINT `Computeur_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
