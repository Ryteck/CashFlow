-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('INPUT', 'OUTPUT');

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "BudgetType" NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);
