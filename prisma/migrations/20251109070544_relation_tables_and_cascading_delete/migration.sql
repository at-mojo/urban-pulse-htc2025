-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_reportId_fkey";

-- CreateTable
CREATE TABLE "ReportRelation" (
    "relationId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "ReportRelation_pkey" PRIMARY KEY ("relationId","reportId")
);

-- CreateTable
CREATE TABLE "Relation" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    "urgency" "Urgency" NOT NULL,

    CONSTRAINT "Relation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReportRelation" ADD CONSTRAINT "ReportRelation_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "Relation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRelation" ADD CONSTRAINT "ReportRelation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
