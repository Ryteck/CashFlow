import CategoryRepository from "@/repositories/Category";
import type RouteParams from "@/types/RouteParams";
import { Prisma } from "@prisma/client";

export const revalidate = 0;

interface Segments {
	id: string;
}

type Params = RouteParams<Segments>;

export async function DELETE(request: Request, { params }: Params) {
	try {
		const categoryRepository = new CategoryRepository();
		const category = await categoryRepository.destroy(params.id);

		return Response.json(category);
	} catch (err) {
		let message = "Erro desconhecido";

		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === "P2003")
				message = "Categoria está sendo utilizada por um Budget";
		}

		return Response.json({ message }, { status: 400 });
	}
}
