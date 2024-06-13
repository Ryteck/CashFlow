import { generateHash } from "@/lib/hash";
import UserRepository from "@/repositories/User";
import AuthService from "@/services/auth";
import { z } from "zod";

const postBodySchema = z.object({
	nickname: z.string(),
	password: z.string(),
});

export async function POST(request: Request) {
	const body = await request.json();
	const payload = postBodySchema.parse(body);

	const userRepository = new UserRepository();
	const user = await userRepository.findByNickname(payload.nickname);

	if (user.password !== generateHash(payload.password))
		throw new Error("Wrong crededentials");

	new AuthService().login({
		nickname: payload.nickname,
	});

	return Response.json({ message: "OK" });
}
