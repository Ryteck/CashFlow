import { CyclePeriod } from "@prisma/client";
import { z } from "zod";

export const cycleSchema = z.object({
	id: z.string().uuid(),
	end: z
		.date()
		.or(z.string().transform((arg) => new Date(arg)))
		.nullish(),
	period: z.nativeEnum(CyclePeriod),

	userId: z.string().uuid(),
});

export const upsertCycleSchema = cycleSchema.omit({ id: true }).nullable();
export type UpsertCycleSchema = z.infer<typeof upsertCycleSchema>;
