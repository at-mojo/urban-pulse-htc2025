/*
  Warnings:

  - You are about to drop the column `lat` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `lon` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "lat",
DROP COLUMN "lon";
