import { categorySchema } from "@/schemas/category";
import { cycleSchema, upsertCycleSchema } from "@/schemas/cycle";
import { BudgetType, CyclePeriod } from "@prisma/client";
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
		category: categorySchema,
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

export interface GeneralBudget extends SelectBudgetSchema {
	key: string;
	cycleDay: Date;
}

export const cycleBudgetSchema = selectBudgetSchema
	.array()
	.transform((args) => {
		const cycledBudget: GeneralBudget[] = [];

		let cycleDay: Date = new Date();

		args.forEach((arg, index) => {
			if (!arg.cycleId || !arg.cycle) return;
			if (index === 0) cycleDay = new Date(arg.day);

			while (
				cycleDay < new Date() ||
				(arg.cycle.end && cycleDay < arg.cycle.end)
			) {
				cycledBudget.push({
					key: `${arg.id}&${cycleDay.getTime()}`,

					id: arg.id,

					title: arg.title,
					description: arg.description,
					categoryId: arg.categoryId,
					amount: arg.amount,
					day: arg.day,

					type: arg.type,
					createdAt: arg.createdAt,
					updatedAt: arg.updatedAt,

					category: arg.category,

					cycleId: arg.cycleId,
					cycle: arg.cycle,
					cycleDay,
				});

				cycleDay = new Date(cycleDay);

				if (arg.cycle.period === CyclePeriod.DAY)
					cycleDay.setDate(cycleDay.getDate() + 1);
				else if (arg.cycle.period === CyclePeriod.WEEK)
					cycleDay.setDate(cycleDay.getDate() + 7);
				else if (arg.cycle.period === CyclePeriod.MONTH)
					cycleDay.setMonth(cycleDay.getMonth() + 1);
				else if (arg.cycle.period === CyclePeriod.YEAR)
					cycleDay.setFullYear(cycleDay.getFullYear() + 1);
				else break;
			}
		});

		return cycledBudget;
	});

export type CycleBudgetSchema = z.infer<typeof cycleBudgetSchema>;
