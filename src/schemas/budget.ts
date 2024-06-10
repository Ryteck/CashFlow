import { categorySchema } from "@/schemas/category";
import { cycleSchema, upsertCycleSchema } from "@/schemas/cycle";
import { BudgetType } from "@prisma/client";
import { z } from "zod";

export const budgetSchema = z.object({
	id: z.string().uuid(),

	title: z.string(),
	description: z.string(),
	categoryId: z.string().uuid(),
	amount: z.number(),
	day: z.date().or(z.string().transform((arg) => new Date(arg))),

	type: z.nativeEnum(BudgetType),

	createdAt: z.date(),
	updatedAt: z.date(),

	cycleId: z.string().uuid().nullable(),
});

export const selectBudgetSchema = budgetSchema.merge(
	z.object({
		category: categorySchema.nullable(),
		cycle: cycleSchema.nullable(),
	}),
);

export type SelectBudgetSchema = z.infer<typeof selectBudgetSchema>;

export const upsertBudgetSchema = budgetSchema
	.partial({ id: true })
	.omit({ cycleId: true, createdAt: true, updatedAt: true })
	.merge(z.object({ cycle: upsertCycleSchema }));

export type UpsertBudgetSchema = z.infer<typeof upsertBudgetSchema>;

export const totalsBudgetSchema = z.object({
	name: z.string(),
	color: z.string(),
	earnings: z.number(),
	expenses: z.number(),
	cash: z.number(),
});

export type TotalsBudgetSchema = z.infer<typeof totalsBudgetSchema>;
