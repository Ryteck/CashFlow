import { z } from "zod";

const payloadSchema = z.object({
	nickname: z.string(),
});

export default payloadSchema;
export type PayloadSchema = z.infer<typeof payloadSchema>;
