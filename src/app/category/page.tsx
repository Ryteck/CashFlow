"use client";

import { ColorPickerComponent } from "@/components/color-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { isTextWhite } from "@/lib/luminance";
import { generateSlug } from "@/lib/slug";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(1).max(32),
	color: z.string(),
});

const Page: FC = () => {
	const queryClient = useQueryClient();

	const query = useQuery<Category[]>({
		queryKey: ["categories"],
		queryFn: () => fetch("/api/category").then((response) => response.json()),
		placeholderData: (previousData) => previousData,
	});

	const [selectedBadge, setSelectedBadge] = useState<null | string>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			color: "#000000",
		},
	});

	const onSubmit = form.handleSubmit(async (data) => {
		const response = await fetch("/api/category", {
			method: "POST",
			body: JSON.stringify({
				...data,
				id: selectedBadge ?? undefined,
			}),
		});

		await queryClient.invalidateQueries({ queryKey: ["categories"] });

		const { id } = await response.json();
		setSelectedBadge(id);
	});

	const color = isTextWhite(form.getValues("color")) ? "white" : "black";
	const [colorPickerValue, setColorPickerValue] = useState("#000000");

	return (
		<main className="flex space-y-8 p-4 gap-8">
			<div className="w-96 min-w-[24rem]">
				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome</FormLabel>
									<FormControl>
										<Input placeholder="Vazio" {...field} />
									</FormControl>
									<FormDescription>
										Slug: {generateSlug(form.getValues("name"))}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="color"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Cor de destaque</FormLabel>
									<FormControl>
										<ColorPickerComponent
											value={colorPickerValue}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{selectedBadge !== null && (
							<Button
								onClick={() => {
									fetch(`/api/category/${selectedBadge}`, {
										method: "DELETE",
									})
										.then(async (response) => {
											if (response.status === 400) {
												const data = await response.json();
												toast.error(data.message);
												return;
											}

											await queryClient.invalidateQueries({
												queryKey: ["categories"],
											});

											setSelectedBadge(null);
											form.reset({ name: "", color: "#000000" });
										})
										.catch(console.error);
								}}
								className="w-full"
								variant="destructive"
								type="button"
							>
								Apagar categoria
							</Button>
						)}

						<Button
							className="w-full"
							disabled={form.formState.isSubmitting}
							type="submit"
						>
							Salvar
						</Button>
					</form>
				</Form>
			</div>

			<div className="flex items-start justify-start flex-wrap place-content-start gap-1">
				{query.data?.map((category) => (
					<div
						key={category.id}
						style={{
							borderColor:
								selectedBadge === category.id
									? form.watch("color")
									: "transparent",
						}}
						className="border-2 border-dashed rounded-full flex items-center justify-center p-0.5"
					>
						<Badge
							className="min-h-8 text-center"
							onClick={() => {
								setColorPickerValue(category.color);
								setSelectedBadge(category.id);
								form.reset(category);
							}}
							variant="outline"
							style={{
								cursor: "pointer",
								backgroundColor:
									selectedBadge === category.id
										? form.watch("color")
										: category.color,
							}}
						>
							<p
								style={{
									color:
										selectedBadge === category.id
											? color
											: isTextWhite(category.color)
												? "white"
												: "black",
								}}
								className="text-sm"
							>
								{selectedBadge === category.id && form.watch("name") !== ""
									? form.watch("name")
									: category.name}
							</p>
						</Badge>
					</div>
				))}

				<div
					style={{
						borderColor:
							selectedBadge === null ? form.watch("color") : "transparent",
					}}
					className="border-2 border-dashed rounded-full flex items-center justify-center p-0.5"
				>
					<Badge
						className="min-h-8 text-center"
						onClick={() => {
							setColorPickerValue("#000000");
							setSelectedBadge(null);
							form.reset({ name: "", color: "#000000" });
						}}
						variant="outline"
						style={{
							cursor: "pointer",
							backgroundColor:
								selectedBadge === null ? form.watch("color") : undefined,
						}}
					>
						<p
							style={{
								color: selectedBadge === null ? color : undefined,
							}}
							className="text-sm text-muted-foreground"
						>
							{selectedBadge === null && form.watch("name") !== "" ? (
								form.watch("name")
							) : (
								<PlusIcon />
							)}
						</p>
					</Badge>
				</div>
			</div>
		</main>
	);
};

export default Page;
