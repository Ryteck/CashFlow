import BudgetRepository from "@/repositories/Budget";
import { upsertBudgetSchema } from "@/schemas/budget";
import AuthService from "@/services/auth";

export async function POST(request: Request) {
	const session = await new AuthService().getSession();

	const body = await request.json();
	const parsedBody = upsertBudgetSchema.parse({ ...body, userId: session.id });

	const budgetRepository = new BudgetRepository();
	const budget = await budgetRepository.upsert(parsedBody, session.id);

	return Response.json(budget);
}
