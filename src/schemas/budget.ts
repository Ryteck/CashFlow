import { BudgetType } from "@prisma/client";
import { z } from "zod";

const budgetSchema = z.object({
	id: z.string().uuid(),

	title: z.string(),
	description: z.string(),
	amount: z.number(),

	type: z.nativeEnum(BudgetType),
});

export const storeBudgetSchema = budgetSchema.omit({ id: true });
export type StoreBudgetSchema = z.infer<typeof storeBudgetSchema>;

export const updateBudgetSchema = budgetSchema;
export type UpdateBudgetSchema = z.infer<typeof updateBudgetSchema>;
