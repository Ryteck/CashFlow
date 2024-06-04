import CategoryRepository from "@/repositories/Category";
import { upsertCategorySchema } from "@/schemas/category";

export const revalidate = 0;

export async function GET() {
	const categoryRepository = new CategoryRepository();
	const categories = await categoryRepository.list();

	return Response.json(categories);
}

export async function POST(request: Request) {
	const body = await request.json();
	const parsedBody = upsertCategorySchema.parse(body);

	const categoryRepository = new CategoryRepository();
	const category = await categoryRepository.upsert(parsedBody);

	return Response.json(category);
}
