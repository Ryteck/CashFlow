import BudgetRepository from "@/repositories/Budget";
import type { DashboardSchema } from "@/schemas/dashboard";
import AuthService from "@/services/auth";
import type { NextRequest } from "next/server";

export const revalidate = 0;

export async function GET(request: NextRequest) {
	const session = await new AuthService().getSession();

	const searchParams = request.nextUrl.searchParams;

	const paramsStartDate = searchParams.get("startDate");
	const paramsEndDate = searchParams.get("endDate");

	const startDate = paramsStartDate ? new Date(paramsStartDate) : null;
	const endDate = paramsEndDate ? new Date(paramsEndDate) : null;

	const budgetRepository = new BudgetRepository();

	const [budgets, totals] = await Promise.all([
		budgetRepository.list(startDate, endDate, session.id),
		budgetRepository.totals(startDate, endDate, session.id),
	]);

	const dashboardResponse: DashboardSchema = {
		budgets,
		totals,
		startDate,
		endDate,
	};

	return Response.json(dashboardResponse);
}
