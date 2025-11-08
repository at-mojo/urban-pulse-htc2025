/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `userId` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL;

-- DropTable
DROP TABLE "User";
