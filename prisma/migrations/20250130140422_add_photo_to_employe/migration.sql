/*
  Warnings:

  - Added the required column `namePc` to the `Computeur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Computeur` ADD COLUMN `namePc` VARCHAR(191) NOT NULL;
