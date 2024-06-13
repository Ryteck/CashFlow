import { generateSlug } from "@/lib/slug";
import { z } from "zod";

export const categorySchema = z.object({
	id: z.string().uuid(),
	slug: z.string(),
	name: z.string(),
	color: z.string(),

	userId: z.string().uuid(),
});

export const upsertCategorySchema = categorySchema
	.partial({ id: true })
	.omit({ slug: true })
	.transform((arg) => ({ ...arg, slug: generateSlug(arg.name) }));

export type UpsertCategorySchema = z.infer<typeof upsertCategorySchema>;
