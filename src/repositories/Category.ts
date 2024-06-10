import Repository from "@/domain/Repository";
import type { UpsertCategorySchema } from "@/schemas/category";
import type { Category } from "@prisma/client";

export default class CategoryRepository extends Repository {
	public find(id: string): Promise<Category> {
		return this.prismaClient.category.findUniqueOrThrow({ where: { id } });
	}

	public list(): Promise<Category[]> {
		return this.prismaClient.category.findMany({
			orderBy: { slug: "asc" },
		});
	}

	public upsert({
		id = this.UUID_V0,
		...data
	}: UpsertCategorySchema): Promise<Category> {
		return this.prismaClient.category.upsert({
			where: { id },
			create: data,
			update: data,
		});
	}

	public destroy(id: string): Promise<Category> {
		return this.prismaClient.category.delete({ where: { id } });
	}
}
