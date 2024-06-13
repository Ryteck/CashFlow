import { useDashboardStore } from "@/store/dashboard";
import dynamic from "next/dynamic";
import type { FC } from "react";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
	filter: "earnings" | "expenses";
}

export const CategoryChartComponent: FC<Props> = ({ filter }) => {
	const dashboardStore = useDashboardStore();

	return (
		<ApexCharts
			width="320"
			height="320"
			type="donut"
			options={{
				tooltip: {
					y: {
						formatter: (val) =>
							val.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							}),
					},
				},
				labels: dashboardStore.data.totals.map(({ name }) => name),
				fill: {
					colors: dashboardStore.data.totals.map(({ color }) => color),
				},
				colors: dashboardStore.data.totals.map(({ color }) => color),
			}}
			series={dashboardStore.data.totals.map(({ earnings, expenses }) =>
				filter === "earnings" ? earnings : expenses,
			)}
		/>
	);
};
