"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Budget, BudgetType } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CircleDollarSign,
	CircleMinusIcon,
	CirclePlusIcon,
} from "lucide-react";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	amount: z.number(),
	type: z.nativeEnum(BudgetType),
});

const Page: FC = () => {
	const queryClient = useQueryClient();

	const query = useQuery<Budget[]>({
		queryKey: ["budgets"],
		queryFn: () => fetch("/api/budget").then((response) => response.json()),
	});

	const earnings =
		query.data?.filter(({ type }) => type === BudgetType.INPUT) ?? [];

	const expenses =
		query.data?.filter(({ type }) => type === BudgetType.OUTPUT) ?? [];

	const earningsTotal = earnings.reduce((acc, cur) => acc + cur.amount, 0) ?? 0;
	const expensesTotal = expenses.reduce((acc, cur) => acc + cur.amount, 0) ?? 0;

	const cash = earningsTotal - expensesTotal;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			amount: 0,
			type: BudgetType.INPUT,
		},
	});

	const onSubmit = form.handleSubmit(async (data) => {
		await fetch("/api/budget", {
			body: JSON.stringify(data),
			method: "POST",
		});

		form.reset({
			title: "",
			description: "",
			amount: 0,
		});

		await queryClient.invalidateQueries({ queryKey: ["budgets"] });
	});

	return (
		<main className="w-screen h-screen flex flex-col space-y-8 pt-8">
			<div className="flex mx-auto space-x-8">
				<Card className="w-[30rem] mt-8">
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

				<Card className="w-[30rem] h-fit">
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

				<Card className="w-[30rem] mt-8">
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
			</div>

			<div className="flex mx-auto space-x-8">
				<div className="mt-8 w-[30rem]">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead className="text-right">Amount</TableHead>
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
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<Card className="w-[30rem]">
					<CardHeader>
						<CardTitle>Register new budget</CardTitle>
						<CardDescription>
							Fill in all fields to complete registration
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form id="budget-form" onSubmit={onSubmit} className="space-y-8">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input placeholder="Title" {...field} />
											</FormControl>
											<FormDescription>
												This is your public display name.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Input placeholder="Description" {...field} />
											</FormControl>
											<FormDescription>
												This is your public display name.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="amount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Amount</FormLabel>
											<FormControl>
												<Input
													type="text"
													placeholder="Amount"
													value={field.value}
													onChange={(e) => {
														const value = e.target.value;
														const newValue = Number(value);
														const hasDot = value[value.length - 1] === ".";

														if (Number.isNaN(newValue)) return;

														if (hasDot) field.onChange(`${newValue}.`);
														else field.onChange(newValue);
													}}
												/>
											</FormControl>
											<FormDescription>
												This is your public display name.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel>Type</FormLabel>
											<FormControl>
												<RadioGroup
													onValueChange={field.onChange}
													defaultValue={field.value}
													className="flex flex-col space-y-1"
												>
													<FormItem className="flex items-center space-x-3 space-y-0">
														<FormControl>
															<RadioGroupItem value={BudgetType.INPUT} />
														</FormControl>
														<FormLabel className="font-normal">
															Earning
														</FormLabel>
													</FormItem>
													<FormItem className="flex items-center space-x-3 space-y-0">
														<FormControl>
															<RadioGroupItem value={BudgetType.OUTPUT} />
														</FormControl>
														<FormLabel className="font-normal">
															Expense
														</FormLabel>
													</FormItem>
												</RadioGroup>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</form>
						</Form>
					</CardContent>
					<CardFooter>
						<Button
							className="w-full"
							disabled={form.formState.isSubmitting}
							form="budget-form"
							type="submit"
						>
							Submit
						</Button>
					</CardFooter>
				</Card>

				<div className="mt-8 w-[30rem]">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead className="text-right">Amount</TableHead>
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
