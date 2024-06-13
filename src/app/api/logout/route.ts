import AuthService from "@/services/auth";

export async function POST() {
	new AuthService().logout();
	return Response.json({ message: "OK" });
}
