import BudgetRepository from "@/repositories/Budget";
import type RouteParams from "@/types/RouteParams";

export const revalidate = 0;

interface Segments {
	id: string;
}

type Params = RouteParams<Segments>;

export async function DELETE(request: Request, { params }: Params) {
	const budgetRepository = new BudgetRepository();
	const budget = await budgetRepository.destroy(params.id);

	return Response.json(budget);
}
