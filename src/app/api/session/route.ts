import AuthService from "@/services/auth";

export const revalidate = 0;

export async function GET() {
	const session = await new AuthService().getSession();
	return Response.json(session);
}
