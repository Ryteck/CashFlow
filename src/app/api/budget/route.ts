import BudgetRepository from "@/repositories/Budget";
import { storeBudgetSchema, updateBudgetSchema } from "@/schemas/budget";

export const revalidate = 0;

export async function GET() {
	const budgetRepository = new BudgetRepository();
	const budgets = await budgetRepository.list();

	return Response.json(budgets);
}

export async function POST(request: Request) {
	const body = await request.json();
	const parsedBody = storeBudgetSchema.parse(body);

	const budgetRepository = new BudgetRepository();
	const budget = await budgetRepository.store(parsedBody);

	return Response.json(budget);
}

export async function PUT(request: Request) {
	const body = await request.json();
	const parsedBody = updateBudgetSchema.parse(body);

	const budgetRepository = new BudgetRepository();
	const budget = await budgetRepository.update(parsedBody);

	return Response.json(budget);
}
