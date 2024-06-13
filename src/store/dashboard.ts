import type { DashboardSchema } from "@/schemas/dashboard";
import { create } from "zustand";

interface ZustandStore {
	data: DashboardSchema;

	load: (startDate: null | string, endDate: null | string) => Promise<void>;
}

export const useDashboardStore = create<ZustandStore>()((setState) => ({
	data: { budgets: [], totals: [], startDate: null, endDate: null },

	async load(startDate, endDate) {
		const startDateParam = startDate ? `startDate=${startDate}` : "";
		const endDateParam = endDate ? `endDate=${endDate}` : "";

		const dashboardResponse = await fetch(
			`/api/dashboard?${startDateParam}&${endDateParam}`,
		);

		const dashboardData = await dashboardResponse.json();

		setState({ data: dashboardData });
	},
}));
