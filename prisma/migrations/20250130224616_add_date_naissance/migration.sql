/*
  Warnings:

  - You are about to drop the column `age` on the `Employe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Employe` DROP COLUMN `age`,
    ADD COLUMN `dateNaissance` DATETIME(3) NULL;
