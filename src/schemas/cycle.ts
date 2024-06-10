import { CyclePeriod } from "@prisma/client";
import { z } from "zod";

export const cycleSchema = z.object({
	id: z.string().uuid(),
	end: z.date().nullish(),
	period: z.nativeEnum(CyclePeriod),
});

export const upsertCycleSchema = cycleSchema.omit({ id: true }).nullable();
export type UpsertCycleSchema = z.infer<typeof upsertCycleSchema>;
