"use client";

import { useDashboardStore } from "@/store/dashboard";
import { BudgetType } from "@prisma/client";
import dynamic from "next/dynamic";
import { type FC, useEffect, useState } from "react";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BudgetLineData {
	label: string;
	month: number;
	year: number;
	earnings: number;
	expenses: number;
}

export const BudgetLineComponent: FC = () => {
	const dashboardStore = useDashboardStore();
	const [budgetLineData, setBudgetLineData] = useState<BudgetLineData[]>([]);

	useEffect(() => {
		const recordBudget: Record<string, BudgetLineData> = {};

		for (const budget of dashboardStore.data.budgets) {
			const cycleDay = new Date(budget.cycleDay);

			const month = cycleDay.getMonth() + 1;
			const year = cycleDay.getFullYear();

			const label = `${String(month).padStart(2, "0")}/${year}`;

			if (!recordBudget[label])
				recordBudget[label] = {
					label,
					month,
					year,
					earnings: 0,
					expenses: 0,
				};

			if (budget.type === BudgetType.INPUT)
				recordBudget[label].earnings += budget.amount;

			if (budget.type === BudgetType.OUTPUT)
				recordBudget[label].expenses += budget.amount;
		}

		console.log(
			Object.values(recordBudget).sort((a, b) => {
				const diffYear = a.year - b.year;
				return diffYear !== 0 ? diffYear : a.month - b.month;
			}),
		);

		setBudgetLineData(
			Object.values(recordBudget).sort((a, b) => {
				const diffYear = a.year - b.year;
				return diffYear !== 0 ? diffYear : a.month - b.month;
			}),
		);
	}, [dashboardStore.data]);

	return (
		<ApexCharts
			width={1080}
			height={200}
			type="area"
			options={{
				stroke: {
					curve: "smooth",
				},
				xaxis: {
					type: "category",
					categories: budgetLineData.map(({ label }) => label),
				},
				tooltip: {
					y: {
						formatter: (val) =>
							val.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							}),
					},
				},
				chart: {
					sparkline: { enabled: true },
				},
			}}
			series={[
				{
					name: "Ganhos",
					data: budgetLineData.map(({ earnings }) => earnings),
					color: "#10b981",
				},
				{
					name: "Gastos",
					data: budgetLineData.map(({ expenses }) => expenses),
					color: "#ef4444",
				},
			]}
		/>
	);
};
