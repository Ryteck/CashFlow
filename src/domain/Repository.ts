import { PrismaClient } from "@prisma/client";

// biome-ignore lint/suspicious/noShadowRestrictedNames:
declare const globalThis: { prismaClient: PrismaClient } & typeof global;

export default abstract class Repository {
	protected readonly prismaClient: PrismaClient;

	constructor() {
		this.prismaClient = globalThis.prismaClient ?? new PrismaClient();

		if (process.env.NODE_ENV !== "production")
			globalThis.prismaClient = this.prismaClient;
	}
}
