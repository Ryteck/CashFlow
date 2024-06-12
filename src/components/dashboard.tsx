"use client";

import { BudgetFormComponent } from "@/components/form/budget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { isTextWhite } from "@/lib/luminance";
import { cn } from "@/lib/utils";
import type { GeneralBudget, TotalsBudgetSchema } from "@/schemas/budget";
import { BudgetType } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	CalendarIcon,
	CircleDollarSign,
	CircleMinusIcon,
	CirclePlusIcon,
	EraserIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FC, useEffect, useState } from "react";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

export const DashboardComponent: FC = () => {
	const [budgets, setBudgets] = useState<GeneralBudget[]>([]);
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

	async function loadData() {
		const startDateParam = startDate ? `startDate=${startDate}` : "";
		const endDateParam = endDate ? `endDate=${endDate}` : "";

		const [budgetsResponse, totalsResponse] = await Promise.all([
			fetch(`/api/budget?${startDateParam}&${endDateParam}`).then((response) =>
				response.json(),
			),
			fetch(`/api/totals?${startDateParam}&${endDateParam}`).then((response) =>
				response.json(),
			),
		]);

		setBudgets(budgetsResponse);
		setBruteTotals(totalsResponse);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		loadData().catch(console.error);
	}, []);

	return (
		<main className="w-full flex flex-col items-center pt-8 gap-8">
			<div className="w-11/12 flex gap-8">
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

				<div className="flex flex-col gap-2 mx-auto">
					<Label>Data inicial:</Label>
					<div className="flex gap-2 mb-4">
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
									disabled={(date) =>
										date > new Date() || (!!endDate && date > new Date(endDate))
									}
								/>
							</PopoverContent>
						</Popover>

						<Button
							size="icon"
							variant="destructive"
							onClick={() => {
								const params = new URLSearchParams(searchParams);
								params.delete("startDate");
								router.replace(`${pathname}?${params.toString()}`);
							}}
						>
							<EraserIcon />
						</Button>
					</div>

					<Label>Data final:</Label>
					<div className="flex gap-2 mb-4">
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
										date > new Date() ||
										(!!startDate && date < new Date(startDate))
									}
								/>
							</PopoverContent>
						</Popover>

						<Button
							size="icon"
							variant="destructive"
							onClick={() => {
								const params = new URLSearchParams(searchParams);
								params.delete("endDate");
								router.replace(`${pathname}?${params.toString()}`);
							}}
						>
							<EraserIcon />
						</Button>
					</div>

					<Button onClick={loadData}>Filtrar</Button>
				</div>

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
			<div className="flex gap-8">
				<div>
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

					<Table>
						<TableCaption>Lista dos ganhos por categorias.</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Categoria</TableHead>
								<TableHead className="text-right">Valor</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bruteTotals.map((category) => (
								<TableRow key={category.name}>
									<TableCell>{category.name}</TableCell>
									<TableCell className="text-right">
										{category.earnings.toLocaleString("pt-BR", {
											style: "currency",
											currency: "BRL",
										})}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<div>
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

					<Table>
						<TableCaption>Lista dos orçamentos por categorias.</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Categoria</TableHead>
								<TableHead className="text-right">Valor</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bruteTotals.map((category) => (
								<TableRow key={category.name}>
									<TableCell>{category.name}</TableCell>
									<TableCell className="text-right">
										{category.cash.toLocaleString("pt-BR", {
											style: "currency",
											currency: "BRL",
										})}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<div>
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

					<Table>
						<TableCaption>Lista dos gastos por categorias.</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>Categoria</TableHead>
								<TableHead className="text-right">Valor</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bruteTotals.map((category) => (
								<TableRow key={category.name}>
									<TableCell>{category.name}</TableCell>
									<TableCell className="text-right">
										{category.expenses.toLocaleString("pt-BR", {
											style: "currency",
											currency: "BRL",
										})}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="w-11/12">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Ganho</TableHead>
							<TableHead>Categoria</TableHead>
							<TableHead>Data</TableHead>
							<TableHead>Valor</TableHead>
							<TableHead className="text-center">#</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{budgets.map((budget) => (
							<TableRow key={budget.key}>
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
									{format(budget.cycleDay, "P", { locale: ptBR })}
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

								<TableCell className="text-center">
									<BudgetFormComponent budget={budget} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</main>
	);
};
