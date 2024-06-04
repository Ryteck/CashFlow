"use client";

import { BudgetFormComponent } from "@/components/form/budget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type Budget, BudgetType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
	CircleDollarSign,
	CircleMinusIcon,
	CirclePlusIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { FC } from "react";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const Page: FC = () => {
	const query = useQuery<Budget[]>({
		queryKey: ["budgets"],
		queryFn: () => fetch("/api/budget").then((response) => response.json()),
		placeholderData: (previousData) => previousData,
	});

	const earnings =
		query.data?.filter(({ type }) => type === BudgetType.INPUT) ?? [];

	const expenses =
		query.data?.filter(({ type }) => type === BudgetType.OUTPUT) ?? [];

	const earningsTotal = earnings.reduce((acc, cur) => acc + cur.amount, 0);
	const expensesTotal = expenses.reduce((acc, cur) => acc + cur.amount, 0);

	const cash = earningsTotal - expensesTotal;

	return (
		<main className="mx-auto w-fit flex space-x-8 pt-8">
			<div className="flex flex-col min-w-[30rem] space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							Earnings
							<CirclePlusIcon className="text-emerald-500" />
						</CardTitle>
					</CardHeader>
					<CardContent className="font-mono">
						<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
							{earningsTotal.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
							})}
						</h1>
					</CardContent>
				</Card>

				<div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead className="text-right">Amount</TableHead>
								<TableHead className="text-center">Access</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{earnings.map((earning) => (
								<TableRow key={earning.id}>
									<TableCell className="flex flex-col">
										<p className="font-bold text-xl">{earning.title}</p>
										<p className="text-xs">{earning.description}</p>
									</TableCell>

									<TableCell className="text-right">
										{earning.amount.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
										})}
									</TableCell>

									<TableCell className="text-center">
										<BudgetFormComponent budget={earning} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="flex flex-col min-w-[30rem] space-y-4">
				<Card className="h-fit">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							Cash
							<CircleDollarSign className="text-slate-500" />
						</CardTitle>
					</CardHeader>
					<CardContent className="font-mono">
						<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
							{cash.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
							})}
						</h1>
					</CardContent>
				</Card>

				<ApexCharts
					width={480}
					height={200}
					type="area"
					options={{
						stroke: {
							curve: "smooth",
						},
						xaxis: {
							type: "category",
							categories: [
								"01/2018",
								"02/2018",
								"03/2018",
								"04/2018",
								"05/2018",
								"06/2018",
								"07/2018",
							],
						},
						tooltip: {
							y: {
								formatter: (val) =>
									val.toLocaleString("en-US", {
										style: "currency",
										currency: "USD",
									}),
							},
						},
						chart: {
							sparkline: { enabled: true },
						},
					}}
					series={[
						{
							name: "Earnings",
							data: [31, 40, 28, 51, 42, 109, 100],
							color: "#10b981",
						},
						{
							name: "Expenses",
							data: [11, 32, 45, 32, 34, 52, 41],
							color: "#ef4444",
						},
					]}
				/>

				<BudgetFormComponent />
			</div>

			<div className="flex flex-col min-w-[30rem] space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							Expenses
							<CircleMinusIcon className="text-red-500" />
						</CardTitle>
					</CardHeader>
					<CardContent className="font-mono">
						<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
							{expensesTotal.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
							})}
						</h1>
					</CardContent>
				</Card>

				<div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead className="text-right">Amount</TableHead>
								<TableHead className="text-center">Access</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{expenses.map((expense) => (
								<TableRow key={expense.id}>
									<TableCell className="flex flex-col">
										<p className="font-bold text-xl">{expense.title}</p>
										<p className="text-xs">{expense.description}</p>
									</TableCell>

									<TableCell className="text-right">
										{expense.amount.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
										})}
									</TableCell>

									<TableCell className="text-center">
										<BudgetFormComponent budget={expense} />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</main>
	);
};

export default Page;
