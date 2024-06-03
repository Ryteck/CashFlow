import Repository from "@/domain/Repository";
import type { StoreBudgetSchema, UpdateBudgetSchema } from "@/schemas/budget";
import type { Budget } from "@prisma/client";

export default class BudgetRepository extends Repository {
	public list(): Promise<Budget[]> {
		return this.prismaClient.budget.findMany();
	}

	public find(id: string): Promise<Budget> {
		return this.prismaClient.budget.findUniqueOrThrow({ where: { id } });
	}

	public store(data: StoreBudgetSchema): Promise<Budget> {
		return this.prismaClient.budget.create({ data });
	}

	public update({ id, ...data }: UpdateBudgetSchema): Promise<Budget> {
		return this.prismaClient.budget.update({ where: { id }, data });
	}

	public destroy(id: string): Promise<Budget> {
		return this.prismaClient.budget.delete({ where: { id } });
	}
}
