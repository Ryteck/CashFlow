"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { isTextWhite } from "@/lib/luminance";
import { cn } from "@/lib/utils";
import type { SelectBudgetSchema, TotalsBudgetSchema } from "@/schemas/budget";
import { BudgetType } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	CalendarIcon,
	CircleDollarSign,
	CircleMinusIcon,
	CirclePlusIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FC, useEffect, useState } from "react";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

export const DashboardComponent: FC = () => {
	const [budgets, setBudgets] = useState<SelectBudgetSchema[]>([]);
	const [bruteTotals, setBruteTotals] = useState<TotalsBudgetSchema[]>([]);

	const totals = ((bruteTotals ?? []) as TotalsBudgetSchema[]).reduce(
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

	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

	const startDate = searchParams.get("startDate");
	const endDate = searchParams.get("endDate");

	useEffect(() => {
		const startDateParam = startDate ? `startDate=${startDate}` : "";
		const endDateParam = endDate ? `endDate=${endDate}` : "";

		fetch(`/api/budget?${startDateParam}&${endDateParam}`)
			.then((response) => response.json())
			.then(setBudgets);

		fetch(`/api/totals?${startDateParam}&${endDateParam}`)
			.then((response) => response.json())
			.then(setBruteTotals);
	}, [startDate, endDate]);

	return (
		<main className="w-full flex flex-col items-center space-x-8 pt-8 gap-4">
			<div className="flex gap-8">
				<Card className="min-w-96">
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

				<Card className="min-w-96">
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

				<Card className="min-w-96">
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
			</div>

			<div className="flex gap-2">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={"outline"}
							className={cn(
								"w-[240px] pl-3 text-left font-normal",
								!startDate && "text-muted-foreground",
							)}
						>
							{startDate ? (
								format(startDate, "PPP", { locale: ptBR })
							) : (
								<span>Pick a date</span>
							)}
							<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							defaultMonth={startDate ? new Date(startDate) : new Date()}
							mode="single"
							selected={startDate ? new Date(startDate) : undefined}
							onSelect={(date) => {
								const params = new URLSearchParams(searchParams);

								params.delete("startDate");

								if (date) params.set("startDate", date.toISOString());

								router.replace(`${pathname}?${params.toString()}`);
							}}
							disabled={(date) => (endDate ? date > new Date(endDate) : false)}
						/>
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={"outline"}
							className={cn(
								"w-[240px] pl-3 text-left font-normal",
								!endDate && "text-muted-foreground",
							)}
						>
							{endDate ? (
								format(endDate, "PPP", { locale: ptBR })
							) : (
								<span>Pick a date</span>
							)}
							<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							defaultMonth={endDate ? new Date(endDate) : new Date()}
							mode="single"
							selected={endDate ? new Date(endDate) : undefined}
							onSelect={(date) => {
								const params = new URLSearchParams(searchParams);

								params.delete("endDate");

								if (date) params.set("endDate", date.toISOString());

								router.replace(`${pathname}?${params.toString()}`);
							}}
							disabled={(date) =>
								startDate ? date < new Date(startDate) : false
							}
						/>
					</PopoverContent>
				</Popover>
			</div>

			<div className="flex gap-8">
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
						labels: bruteTotals.map(({ name }) => name),
						fill: {
							colors: bruteTotals.map(({ color }) => color),
						},
						colors: bruteTotals.map(({ color }) => color),
					}}
					series={bruteTotals.map(({ earnings }) => earnings)}
				/>

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
						labels: bruteTotals.map(({ name }) => name),
						fill: {
							colors: bruteTotals.map(({ color }) => color),
						},
						colors: bruteTotals.map(({ color }) => color),
					}}
					series={bruteTotals.map(({ expenses }) => expenses)}
				/>
			</div>

			<div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Ganho</TableHead>
							<TableHead>Categoria</TableHead>
							<TableHead>Data</TableHead>
							<TableHead>Valor</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{budgets.map((budget) => (
							<TableRow key={budget.id}>
								<TableCell className="flex flex-col">
									<p className="font-bold text-xl">{budget.title}</p>
									<p className="text-xs">{budget.description}</p>
								</TableCell>

								<TableCell>
									{budget.category ? (
										<Badge
											style={{
												color: isTextWhite(budget.category.color)
													? "white"
													: "black",
												backgroundColor: budget.category.color,
											}}
										>
											{budget.category.name}
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

								<TableCell>
									{format(budget.day, "P", { locale: ptBR })}
								</TableCell>

								<TableCell>
									<div className="flex items-center gap-2">
										{budget.type === BudgetType.INPUT && (
											<CirclePlusIcon className="text-emerald-500" />
										)}

										{budget.type === BudgetType.OUTPUT && (
											<CircleMinusIcon className="text-red-500" />
										)}

										{budget.amount.toLocaleString("pt-BR", {
											style: "currency",
											currency: "BRL",
										})}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</main>
	);
};
