-- CreateTable
CREATE TABLE "Flow" (
    "budgetId" TEXT NOT NULL,
    "cycleId" TEXT,

    CONSTRAINT "Flow_pkey" PRIMARY KEY ("budgetId")
);

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
