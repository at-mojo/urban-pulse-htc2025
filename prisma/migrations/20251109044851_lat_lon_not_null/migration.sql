/*
  Warnings:

  - Made the column `lat` on table `Report` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lon` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "lat" SET NOT NULL,
ALTER COLUMN "lon" SET NOT NULL;
