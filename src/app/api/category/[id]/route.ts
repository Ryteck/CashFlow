import CategoryRepository from "@/repositories/Category";
import type RouteParams from "@/types/RouteParams";

export const revalidate = 0;

interface Segments {
	id: string;
}

type Params = RouteParams<Segments>;

export async function GET(request: Request, { params }: Params) {
	const categoryRepository = new CategoryRepository();
	const category = await categoryRepository.find(params.id);

	return Response.json(category);
}

export async function DELETE(request: Request, { params }: Params) {
	const categoryRepository = new CategoryRepository();
	const category = await categoryRepository.destroy(params.id);

	return Response.json(category);
}
