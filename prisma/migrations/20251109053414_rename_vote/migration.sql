/*
  Warnings:

  - The `voteValue` column on the `Vote` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "voteValue",
ADD COLUMN     "voteValue" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "VoteValue";
