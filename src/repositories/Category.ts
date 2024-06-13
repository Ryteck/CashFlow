import Repository from "@/domain/Repository";
import type { UpsertCategorySchema } from "@/schemas/category";
import type { Category } from "@prisma/client";

export default class CategoryRepository extends Repository {
	public find(id: string, userId: string): Promise<Category> {
		return this.prismaClient.category.findUniqueOrThrow({
			where: { id, userId },
		});
	}

	public list(userId: string): Promise<Category[]> {
		return this.prismaClient.category.findMany({
			where: { userId },
			orderBy: { slug: "asc" },
		});
	}

	public upsert(
		{ id = this.UUID_V0, ...data }: UpsertCategorySchema,
		userId: string,
	): Promise<Category> {
		data.userId = userId;

		return this.prismaClient.category.upsert({
			where: { id, userId },
			create: data,
			update: data,
		});
	}

	public destroy(id: string, userId: string): Promise<Category> {
		return this.prismaClient.category.delete({ where: { id, userId } });
	}
}
