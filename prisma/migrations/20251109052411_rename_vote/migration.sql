/*
  Warnings:

  - You are about to drop the `Votes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VoteValue" AS ENUM ('upvote', 'downvote');

-- DropForeignKey
ALTER TABLE "Votes" DROP CONSTRAINT "Votes_reportId_fkey";

-- DropTable
DROP TABLE "Votes";

-- DropEnum
DROP TYPE "Vote";

-- CreateTable
CREATE TABLE "Vote" (
    "userId" UUID NOT NULL,
    "reportId" TEXT NOT NULL,
    "vote" "VoteValue" NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("userId","reportId")
);

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
