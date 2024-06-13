import { createHash } from "node:crypto";

export const generateHash = (arg: string): string =>
	createHash("sha256").update(arg).digest("hex");
