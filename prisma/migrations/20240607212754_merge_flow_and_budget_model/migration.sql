/*
  Warnings:

  - You are about to drop the `Flow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Flow" DROP CONSTRAINT "Flow_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "Flow" DROP CONSTRAINT "Flow_cycleId_fkey";

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "cycleId" TEXT;

-- DropTable
DROP TABLE "Flow";

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
