"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Budget, BudgetType } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AMOUNT_LIMIT = 999_999_999;

const formSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string(),
	amount: z.number().positive().max(AMOUNT_LIMIT),
	type: z.nativeEnum(BudgetType),
});

interface Props {
	budget?: Budget;
}

export const BudgetFormComponent: FC<Props> = ({ budget }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: budget?.title ?? "",
			description: budget?.description ?? "",
			amount: budget?.amount ?? 0,
			type: budget?.type ?? BudgetType.INPUT,
		},
	});

	const onSubmit = form.handleSubmit(async (data) => {
		await fetch("/api/budget", {
			body: JSON.stringify({ ...data, id: budget?.id }),
			method: budget ? "PUT" : "POST",
		});

		if (!budget) {
			setIsDialogOpen(false);

			form.reset({
				title: "",
				description: "",
				amount: 0,
			});
		}

		await queryClient.invalidateQueries({ queryKey: ["budgets"] });
	});

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button
					className={budget ? "rounded-full" : ""}
					variant={budget ? "ghost" : "default"}
					size={budget ? "icon" : "default"}
				>
					{budget ? <PencilIcon /> : "Record new budget"}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>

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
												<FormLabel className="font-normal">Earning</FormLabel>
											</FormItem>
											<FormItem className="flex items-center space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value={BudgetType.OUTPUT} />
												</FormControl>
												<FormLabel className="font-normal">Expense</FormLabel>
											</FormItem>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>

				<DialogFooter>
					{budget && (
						<Button
							onClick={() => {
								fetch(`/api/budget/${budget.id}`, {
									method: "DELETE",
								}).then(() =>
									queryClient.invalidateQueries({ queryKey: ["budgets"] }),
								);
							}}
							variant="destructive"
						>
							Delete budget
						</Button>
					)}

					<Button form="budget-form" type="submit">
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
