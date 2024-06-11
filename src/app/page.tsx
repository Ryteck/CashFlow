"use client";

import { BudgetFormComponent } from "@/components/form/budget";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { isTextWhite } from "@/lib/luminance";
import type { GeneralBudget, TotalsBudgetSchema } from "@/schemas/budget";
import { BudgetType } from "@prisma/client";
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
	const queryBudgets = useQuery<GeneralBudget[]>({
		queryKey: ["budgets"],
		queryFn: () => fetch("/api/budget").then((response) => response.json()),
		placeholderData: (previousData) => previousData,
	});

	const queryTotals = useQuery<TotalsBudgetSchema[]>({
		queryKey: ["totals"],
		queryFn: () => fetch("/api/totals").then((response) => response.json()),
		placeholderData: (previousData) => previousData,
	});

	const earnings =
		queryBudgets.data?.filter(({ type }) => type === BudgetType.INPUT) ?? [];

	const expenses =
		queryBudgets.data?.filter(({ type }) => type === BudgetType.OUTPUT) ?? [];

	const totals = ((queryTotals.data ?? []) as TotalsBudgetSchema[]).reduce(
		(acc, cur) => {
			acc.earnings += cur.earnings;
			acc.expenses += cur.expenses;
			acc.cash += cur.cash;
			return acc;
		},
		{
			earnings: 0,
			expenses: 0,
			cash: 0,
		} as Omit<TotalsBudgetSchema, "category">,
	);

	return (
		<main className="mx-auto w-fit flex space-x-8 pt-8">
			<div className="flex flex-col min-w-96 space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							Ganhos
							<CirclePlusIcon className="text-emerald-500" />
						</CardTitle>
					</CardHeader>
					<CardContent className="font-mono">
						<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
							{totals.earnings.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							})}
						</h1>
					</CardContent>
				</Card>

				<div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Ganho</TableHead>
								<TableHead>Categoria</TableHead>
								<TableHead className="text-right">Valor</TableHead>
								<TableHead className="text-center">#</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{earnings.map((earning) => (
								<TableRow key={earning.key}>
									<TableCell className="flex flex-col">
										<p className="font-bold text-xl">{earning.title}</p>
										<p className="text-xs">{earning.description}</p>
									</TableCell>

									<TableCell>
										{earning.category ? (
											<Badge
												style={{
													color: isTextWhite(earning.category.color)
														? "white"
														: "black",
													backgroundColor: earning.category.color,
												}}
											>
												{earning.category.name}
											</Badge>
										) : (
											<Badge
												variant="outline"
												className="text-sm text-muted-foreground"
											>
												Empty
											</Badge>
										)}
									</TableCell>

									<TableCell className="text-right">
										{earning.amount.toLocaleString("pt-BR", {
											style: "currency",
											currency: "BRL",
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

			<div className="flex flex-col min-w-96 space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							Orçamento
							<CircleDollarSign className="text-slate-500" />
						</CardTitle>
					</CardHeader>
					<CardContent className="font-mono">
						<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
							{totals.cash.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							})}
						</h1>
					</CardContent>
				</Card>

				<ApexCharts
					width={384}
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
							data: [31, 40, 28, 51, 42, 109, 100],
							color: "#10b981",
						},
						{
							name: "Gastos",
							data: [11, 32, 45, 32, 34, 52, 41],
							color: "#ef4444",
						},
					]}
				/>

				<BudgetFormComponent />
			</div>

			<div className="flex flex-col min-w-96 space-y-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							Gastos
							<CircleMinusIcon className="text-red-500" />
						</CardTitle>
					</CardHeader>
					<CardContent className="font-mono">
						<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
							{totals.expenses.toLocaleString("pt-BR", {
								style: "currency",
								currency: "BRL",
							})}
						</h1>
					</CardContent>
				</Card>

				<div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Gasto</TableHead>
								<TableHead>Categoria</TableHead>
								<TableHead className="text-right">Valor</TableHead>
								<TableHead className="text-center">#</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{expenses.map((expense) => (
								<TableRow key={expense.key}>
									<TableCell className="flex flex-col">
										<p className="font-bold text-xl">{expense.title}</p>
										<p className="text-xs">{expense.description}</p>
									</TableCell>

									<TableCell>
										{expense.category && (
											<Badge
												style={{
													color: isTextWhite(expense.category.color)
														? "white"
														: "black",
													backgroundColor: expense.category.color,
												}}
											>
												{expense.category.name}
											</Badge>
										)}
									</TableCell>

									<TableCell className="text-right">
										{expense.amount.toLocaleString("pt-BR", {
											style: "currency",
											currency: "BRL",
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
