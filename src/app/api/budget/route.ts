import BudgetRepository from "@/repositories/Budget";
import { upsertBudgetSchema } from "@/schemas/budget";
import type { NextRequest } from "next/server";

export const revalidate = 0;

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;

	const paramsStartDate = searchParams.get("startDate");
	const paramsEndDate = searchParams.get("endDate");

	const startDate = paramsStartDate ? new Date(paramsStartDate) : null;
	const endDate = paramsEndDate ? new Date(paramsEndDate) : null;

	const budgetRepository = new BudgetRepository();
	const budgetList = await budgetRepository.list(startDate, endDate);

	return Response.json(budgetList);
}

export async function POST(request: Request) {
	const body = await request.json();
	const parsedBody = upsertBudgetSchema.parse(body);

	const budgetRepository = new BudgetRepository();
	const budget = await budgetRepository.upsert(parsedBody);

	return Response.json(budget);
}
