import { categorySchema } from "@/schemas/category";
import { BudgetType } from "@prisma/client";
import { z } from "zod";

export const budgetSchema = z.object({
	id: z.string().uuid(),

	title: z.string(),
	description: z.string(),
	categoryId: z.string(),
	amount: z.number(),
	day: z.date().or(z.string().transform((arg) => new Date(arg))),

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

export const selectBudgetSchema = budgetSchema.merge(
	z.object({ category: categorySchema.nullable() }),
);

export type StoreBudgetSchema = z.infer<typeof storeBudgetSchema>;
export type UpdateBudgetSchema = z.infer<typeof updateBudgetSchema>;
export type SelectBudgetSchema = z.infer<typeof selectBudgetSchema>;
