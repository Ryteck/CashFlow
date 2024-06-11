import BudgetRepository from "@/repositories/Budget";
import type { NextRequest } from "next/server";

export const revalidate = 0;

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;

	const paramsStartDate = searchParams.get("startDate");
	const paramsEndDate = searchParams.get("endDate");

	const startDate = paramsStartDate ? new Date(paramsStartDate) : null;
	const endDate = paramsEndDate ? new Date(paramsEndDate) : null;

	const budgetRepository = new BudgetRepository();

	const totals = await budgetRepository.totals(startDate, endDate);

	return Response.json(
		totals.sort((a, b) => {
			const cashValue = b.cash - a.cash;
			if (cashValue !== 0) return cashValue;

			const aLower = a.name.toLowerCase();
			const bLower = b.name.toLowerCase();

			if (aLower < bLower) return -1;
			if (aLower > bLower) return 1;

			return 0;
		}),
	);
}
