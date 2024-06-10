-- CreateEnum
CREATE TYPE "CyclePeriod" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL,
    "end" TIMESTAMP(3),
    "period" "CyclePeriod" NOT NULL,

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("id")
);
