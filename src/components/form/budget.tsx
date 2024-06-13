"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { isTextWhite } from "@/lib/luminance";
import { cn } from "@/lib/utils";
import type { SelectBudgetSchema } from "@/schemas/budget";
import type { UpsertCycleSchema } from "@/schemas/cycle";
import { useDashboardStore } from "@/store/dashboard";
import { zodResolver } from "@hookform/resolvers/zod";
import { BudgetType, type Category, CyclePeriod } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const AMOUNT_LIMIT = 999_999_999;

const formSchema = z.object({
	title: z.string().min(1, "Nome é obrigatório"),
	description: z.string().min(1, "Descrição é obrigatório"),
	amount: z
		.string()
		.transform(Number)
		.or(z.number())
		.refine((arg) => arg > 0, "O valor precisa ser maior que 0")
		.refine(
			(arg) => arg <= AMOUNT_LIMIT,
			`O valor máximo é de ${AMOUNT_LIMIT.toLocaleString("pt-BR", {
				style: "currency",
				currency: "BRL",
			})}`,
		),

	day: z.date(),
	type: z.nativeEnum(BudgetType),
	categoryId: z.string().uuid("Selecione uma categoria válida"),

	// cycle
	enableCycle: z.boolean(),
	period: z.nativeEnum(CyclePeriod),
	end: z.date().optional(),
});

interface Props {
	budget?: SelectBudgetSchema;
	disableTrigger?: boolean;
}

export const BudgetFormComponent: FC<Props> = ({ budget, disableTrigger }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const query = useQuery<Category[]>({
		queryKey: ["categories"],
		queryFn: () => fetch("/api/category").then((response) => response.json()),
		placeholderData: (previousData) => previousData,
	});

	const today = new Date();

	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: budget?.title ?? "",
			description: budget?.description ?? "",
			amount: budget?.amount ?? 0,
			day: budget ? new Date(budget.day) : today,
			type: budget?.type ?? BudgetType.INPUT,
			categoryId: budget?.categoryId ?? "",

			enableCycle: !!budget?.cycleId,
			period: budget?.cycle?.period ?? CyclePeriod.MONTH,
			end: budget?.cycle?.end ?? undefined,
		},
	});

	useEffect(() => {
		if (isDialogOpen) form.reset();
	}, [isDialogOpen, form]);

	const searchParams = useSearchParams();

	const startDate = searchParams.get("startDate");
	const endDate = searchParams.get("endDate");

	const dashboardStore = useDashboardStore();

	const onSubmit = form.handleSubmit(
		async ({ enableCycle, period, end, ...data }) => {
			if (end && end <= data.day) {
				const message = "Data de encerramento do ciclo inválida";

				const description =
					"Se preenchida, a data de encerramento precisa ser maior que a data do orçamento";

				toast.warning(message, { description });

				return;
			}

			const cycle: UpsertCycleSchema = enableCycle
				? { period, end, userId: "00000000-0000-0000-0000-000000000000" }
				: null;

			await fetch("/api/budget", {
				body: JSON.stringify({ ...data, cycle, id: budget?.id }),
				method: "POST",
			});

			if (!budget) {
				setIsDialogOpen(false);
				form.reset();
			}

			dashboardStore.load(startDate, endDate).catch(console.error);
		},
	);

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button
					className={budget ? "rounded-full" : ""}
					variant={budget ? "ghost" : "outline"}
					size="icon"
					disabled={disableTrigger}
				>
					{budget ? <PencilIcon /> : <PlusIcon />}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Orçamento</DialogTitle>
					<DialogDescription>
						{`${
							budget
								? "Faça alterações no seu orçamento aqui"
								: "Cadastre seu orçamento aqui"
						}. Clique em salvar quando terminar.`}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-96">
					<div className="p-8">
						<Form {...form}>
							<form id="budget-form" onSubmit={onSubmit} className="space-y-4">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nome *</FormLabel>
											<FormControl>
												<Input placeholder="Nome" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Descrição *</FormLabel>
											<FormControl>
												<Input placeholder="Descrição" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="day"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Dia *</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"pl-3 text-left font-normal",
																!field.value && "text-muted-foreground",
															)}
														>
															{field.value ? (
																format(field.value, "PPP", { locale: ptBR })
															) : (
																<span>Selecione uma data</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														defaultMonth={form.getValues("day")}
													/>
												</PopoverContent>
											</Popover>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="amount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Valor *</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Amount"
													value={field.value}
													onChange={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel>Tipo de orçamento *</FormLabel>
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
														<FormLabel className="font-normal">Ganho</FormLabel>
													</FormItem>
													<FormItem className="flex items-center space-x-3 space-y-0">
														<FormControl>
															<RadioGroupItem value={BudgetType.OUTPUT} />
														</FormControl>
														<FormLabel className="font-normal">Gasto</FormLabel>
													</FormItem>
												</RadioGroup>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="categoryId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Categoria *</FormLabel>

											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Selecione uma categoria" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{query.data?.map((category) => (
														<SelectItem key={category.id} value={category.id}>
															<Badge
																style={{
																	color: isTextWhite(category.color)
																		? "white"
																		: "black",
																	backgroundColor: category.color,
																}}
															>
																{category.name}
															</Badge>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="enableCycle"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Deseja habilitar ciclos?</FormLabel>
												<FormDescription>
													Repetições agendadas por períodos
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>

								{form.getValues("enableCycle") && (
									<>
										<FormField
											control={form.control}
											name="period"
											render={({ field }) => (
												<FormItem className="space-y-3">
													<FormLabel>Período do ciclo *</FormLabel>
													<FormControl>
														<RadioGroup
															onValueChange={field.onChange}
															defaultValue={field.value}
															className="flex flex-col space-y-1"
														>
															<FormItem className="flex items-center space-x-3 space-y-0">
																<FormControl>
																	<RadioGroupItem value={CyclePeriod.DAY} />
																</FormControl>
																<FormLabel className="font-normal">
																	Diário
																</FormLabel>
															</FormItem>

															<FormItem className="flex items-center space-x-3 space-y-0">
																<FormControl>
																	<RadioGroupItem value={CyclePeriod.WEEK} />
																</FormControl>
																<FormLabel className="font-normal">
																	Semanal
																</FormLabel>
															</FormItem>

															<FormItem className="flex items-center space-x-3 space-y-0">
																<FormControl>
																	<RadioGroupItem value={CyclePeriod.MONTH} />
																</FormControl>
																<FormLabel className="font-normal">
																	Mensal
																</FormLabel>
															</FormItem>

															<FormItem className="flex items-center space-x-3 space-y-0">
																<FormControl>
																	<RadioGroupItem value={CyclePeriod.YEAR} />
																</FormControl>
																<FormLabel className="font-normal">
																	Anual
																</FormLabel>
															</FormItem>
														</RadioGroup>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="end"
											render={({ field }) => (
												<FormItem className="flex flex-col">
													<FormLabel>Fim do ciclo</FormLabel>
													<Popover>
														<PopoverTrigger asChild>
															<FormControl>
																<Button
																	variant={"outline"}
																	className={cn(
																		"pl-3 text-left font-normal",
																		!field.value && "text-muted-foreground",
																	)}
																>
																	{field.value ? (
																		format(field.value, "PPP", { locale: ptBR })
																	) : (
																		<span>Selecione uma data</span>
																	)}
																	<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
																</Button>
															</FormControl>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-0"
															align="start"
														>
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={field.onChange}
																defaultMonth={
																	form.getValues("end") ?? form.getValues("day")
																}
															/>
														</PopoverContent>
													</Popover>
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								)}
							</form>
						</Form>
					</div>
				</ScrollArea>

				<DialogFooter>
					{budget && (
						<Button
							onClick={() => {
								fetch(`/api/budget/${budget.id}`, {
									method: "DELETE",
								}).then(() => dashboardStore.load(startDate, endDate));
							}}
							variant="destructive"
						>
							Apagar
						</Button>
					)}

					<Button
						disabled={form.formState.isSubmitting}
						form="budget-form"
						type="submit"
					>
						Salvar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
