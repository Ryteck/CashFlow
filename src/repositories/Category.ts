import Repository from "@/domain/Repository";
import type { UpsertCategorySchema } from "@/schemas/category";
import type { Category } from "@prisma/client";

const UUID_V0 = "00000000-0000-0000-0000-000000000000";

export default class CategoryRepository extends Repository {
	public list(): Promise<Category[]> {
		return this.prismaClient.category.findMany({
			orderBy: { slug: "asc" },
		});
	}

	public find(id: string): Promise<Category> {
		return this.prismaClient.category.findUniqueOrThrow({ where: { id } });
	}

	public upsert({
		id = UUID_V0,
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
