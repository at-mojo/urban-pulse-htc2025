-- CreateEnum
CREATE TYPE "Vote" AS ENUM ('upvote', 'downvote');

-- CreateTable
CREATE TABLE "Votes" (
    "userId" UUID NOT NULL,
    "reportId" TEXT NOT NULL,
    "vote" "Vote" NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("userId","reportId")
);
