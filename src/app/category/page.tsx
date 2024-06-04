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
		await fetch("/api/category", {
			method: "POST",
			body: JSON.stringify({
				...data,
				id: selectedBadge ?? undefined,
			}),
		});

		await queryClient.invalidateQueries({ queryKey: ["categories"] });

		form.resetField("name");
	});

	const color = isTextWhite(form.getValues("color")) ? "white" : "black";

	return (
		<main className="flex space-y-8 p-8 gap-8">
			<div className="w-96 min-w-[24rem]">
				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Empty" {...field} />
									</FormControl>
									<FormDescription>
										Slug: {generateSlug(form.getValues("name")) || "Empty"}
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
									<FormLabel>Color Picker</FormLabel>
									<FormControl>
										<ColorPickerComponent onChange={field.onChange} />
									</FormControl>
								</FormItem>
							)}
						/>

						<Button
							className="w-full"
							disabled={form.formState.isSubmitting}
							type="submit"
						>
							Save changes
						</Button>
					</form>
				</Form>
			</div>

			<div className="flex items-start justify-start flex-wrap place-content-start">
				{query.data?.map((category) => (
					<div
						key={category.id}
						style={{
							borderColor: form.watch("color"),
							borderStyle: selectedBadge === category.id ? "dashed" : "none",
						}}
						className="border-2 rounded-full flex items-center justify-center p-0.5"
					>
						<Badge
							className="min-h-8 text-center"
							onClick={() => {
								setSelectedBadge(category.id);
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
						borderColor: form.watch("color"),
						borderStyle: selectedBadge === null ? "dashed" : "none",
					}}
					className="border-2 rounded-full flex items-center justify-center p-0.5"
				>
					<Badge
						className="min-h-8 text-center"
						onClick={() => {
							setSelectedBadge(null);
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
