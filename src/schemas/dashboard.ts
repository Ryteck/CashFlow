import { generalBudgetSchema, totalsBudgetSchema } from "@/schemas/budget";
import { z } from "zod";

const dashboardSchema = z.object({
	budgets: generalBudgetSchema.array(),
	totals: totalsBudgetSchema.array(),
	startDate: z.string().or(z.date()).nullable(),
	endDate: z.string().or(z.date()).nullable(),
});

export type DashboardSchema = z.infer<typeof dashboardSchema>;
