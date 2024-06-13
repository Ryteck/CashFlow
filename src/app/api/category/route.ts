import CategoryRepository from "@/repositories/Category";
import { upsertCategorySchema } from "@/schemas/category";
import AuthService from "@/services/auth";

export const revalidate = 0;

export async function GET() {
	const session = await new AuthService().getSession();

	const categoryRepository = new CategoryRepository();
	const categories = await categoryRepository.list(session.id);

	return Response.json(categories);
}

export async function POST(request: Request) {
	const session = await new AuthService().getSession();

	const body = await request.json();
	const parsedBody = upsertCategorySchema.parse({
		...body,
		userId: session.id,
	});

	const categoryRepository = new CategoryRepository();
	const category = await categoryRepository.upsert(parsedBody, session.id);

	return Response.json(category);
}
