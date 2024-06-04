import Repository from "@/domain/Repository";
import type {
	SelectBudgetSchema,
	StoreBudgetSchema,
	UpdateBudgetSchema,
} from "@/schemas/budget";

export default class BudgetRepository extends Repository {
	public list(): Promise<SelectBudgetSchema[]> {
		return this.prismaClient.budget.findMany({
			include: { category: true },
			orderBy: { createdAt: "asc" },
		});
	}

	public find(id: string): Promise<SelectBudgetSchema> {
		return this.prismaClient.budget.findUniqueOrThrow({
			where: { id },
			include: { category: true },
		});
	}

	public store(data: StoreBudgetSchema): Promise<SelectBudgetSchema> {
		return this.prismaClient.budget.create({
			data,
			include: { category: true },
		});
	}

	public update({
		id,
		...data
	}: UpdateBudgetSchema): Promise<SelectBudgetSchema> {
		return this.prismaClient.budget.update({
			where: { id },
			data,
			include: { category: true },
		});
	}

	public destroy(id: string): Promise<SelectBudgetSchema> {
		return this.prismaClient.budget.delete({
			where: { id },
			include: { category: true },
		});
	}
}
