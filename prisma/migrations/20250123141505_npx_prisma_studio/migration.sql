/*
  Warnings:

  - Added the required column `password` to the `Employe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Employe` ADD COLUMN `password` VARCHAR(191) NOT NULL;
