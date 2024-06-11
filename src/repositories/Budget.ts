import Repository from "@/domain/Repository";
import CategoryRepository from "@/repositories/Category";
import {
	type CycleBudgetSchema,
	type GeneralBudget,
	type SelectBudgetSchema,
	type TotalsBudgetSchema,
	type UpsertBudgetSchema,
	cycleBudgetSchema,
} from "@/schemas/budget";
import { BudgetType } from "@prisma/client";

export default class BudgetRepository extends Repository {
	private async cycles(
		startDate: null | Date,
		endDate: null | Date,
	): Promise<CycleBudgetSchema> {
		const budgets = await this.prismaClient.budget.findMany({
			include: { category: true, cycle: true },
			orderBy: { day: "asc" },
			where: {
				cycleId: { not: null },
				day: { lte: endDate ?? new Date() },
				cycle: {
					OR: [
						{ end: null },
						{ end: startDate ? { gte: startDate } : { not: null } },
					],
				},
			},
		});

		let cycle = cycleBudgetSchema.parse(budgets);

		if (startDate) {
			cycle = cycle.filter(({ cycleDay }) => cycleDay >= startDate);
		}

		if (endDate) {
			cycle = cycle.filter(({ cycleDay }) => cycleDay <= endDate);
		}

		return cycle;
	}

	public async totals(
		startDate: null | Date,
		endDate: null | Date,
	): Promise<TotalsBudgetSchema[]> {
		const categoryRepository = new CategoryRepository();
		const budgetTotals: Record<string, TotalsBudgetSchema> = {};

		const budgets = await this.prismaClient.budget.groupBy({
			by: ["categoryId", "type"],
			_sum: { amount: true },
			where: {
				cycleId: null,
				day: {
					gte: startDate ?? undefined,
					lte: endDate ?? new Date(),
				},
			},
		});

		for (const budget of budgets) {
			const { categoryId } = budget;

			if (!budgetTotals[categoryId]) {
				const { name, color } = await categoryRepository.find(categoryId);

				budgetTotals[categoryId] = {
					name,
					color,
					earnings: 0,
					expenses: 0,
					cash: 0,
				};
			}

			const sum = budget._sum.amount ?? 0;

			if (budget.type === BudgetType.INPUT) {
				budgetTotals[categoryId].earnings += sum;
				budgetTotals[categoryId].cash += sum;
			}

			if (budget.type === BudgetType.OUTPUT) {
				budgetTotals[categoryId].expenses += sum;
				budgetTotals[categoryId].cash -= sum;
			}
		}

		const cycles = await this.cycles(startDate, endDate);

		for (const cycle of cycles) {
			if (!budgetTotals[cycle.category.id])
				budgetTotals[cycle.category.id] = {
					name: cycle.category.name,
					color: cycle.category.color,
					earnings: 0,
					expenses: 0,
					cash: 0,
				};

			if (cycle.type === BudgetType.INPUT) {
				budgetTotals[cycle.category.id].earnings += cycle.amount;
				budgetTotals[cycle.category.id].cash += cycle.amount;
			}

			if (cycle.type === BudgetType.OUTPUT) {
				budgetTotals[cycle.category.id].expenses += cycle.amount;
				budgetTotals[cycle.category.id].cash -= cycle.amount;
			}
		}

		return Object.values(budgetTotals);
	}

	public async list(
		startDate: null | Date,
		endDate: null | Date,
	): Promise<GeneralBudget[]> {
		const [budgets, cycles] = await Promise.all([
			this.prismaClient.budget.findMany({
				include: { category: true, cycle: true },
				orderBy: { day: "asc" },
				where: {
					cycleId: null,
					day: {
						gte: startDate ?? undefined,
						lte: endDate ?? new Date(),
					},
				},
			}),
			this.cycles(startDate, endDate),
		]);

		return [
			...budgets.map((arg) => ({ ...arg, key: arg.id, cycleDay: arg.day })),
			...cycles,
		];
	}

	public upsert({
		id = this.UUID_V0,
		cycle,
		...data
	}: UpsertBudgetSchema): Promise<SelectBudgetSchema> {
		return this.prismaClient.$transaction(async (transaction) => {
			const oldBudget = await transaction.budget.findUnique({
				where: { id },
				select: { cycleId: true },
			});

			let cycleId = oldBudget?.cycleId;

			if (cycle) {
				const newCycle = await transaction.cycle.upsert({
					where: { id: cycleId ?? this.UUID_V0 },
					create: cycle,
					update: cycle,
					select: { id: true },
				});

				cycleId = newCycle.id;
			} else {
				if (cycleId) await transaction.cycle.delete({ where: { id: cycleId } });

				cycleId = null;
			}

			const newData = { ...data, cycleId };

			return this.prismaClient.budget.upsert({
				where: { id },
				create: newData,
				update: newData,
				include: { category: true, cycle: true },
			});
		});
	}

	public destroy(id: string): Promise<SelectBudgetSchema> {
		return this.prismaClient.$transaction(async (transaction) => {
			const budget = await transaction.budget.delete({
				where: { id },
				include: { category: true, cycle: true },
			});

			if (budget.cycleId)
				await transaction.cycle.delete({ where: { id: budget.cycleId } });

			return budget;
		});
	}
}
