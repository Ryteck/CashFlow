import { BudgetType } from "@prisma/client";
import { z } from "zod";

const budgetSchema = z.object({
	id: z.string().uuid(),

	title: z.string(),
	description: z.string(),
	amount: z.number(),

	type: z.nativeEnum(BudgetType),

	createdAt: z.date(),
	updatedAt: z.date(),
});

export const storeBudgetSchema = budgetSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const updateBudgetSchema = budgetSchema.omit({
	createdAt: true,
	updatedAt: true,
});

export type StoreBudgetSchema = z.infer<typeof storeBudgetSchema>;
export type UpdateBudgetSchema = z.infer<typeof updateBudgetSchema>;
