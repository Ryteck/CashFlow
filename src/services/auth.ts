import UserRepository from "@/repositories/User";
import payloadSchema, { type PayloadSchema } from "@/schemas/payload";
import type { User } from "@prisma/client";
import { sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const TOKEN_SECRET = String(process.env.TOKEN_SECRET);
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export default class AuthService {
	private readonly cookieName = "cashflow-auth";
	private readonly secret = Buffer.from(TOKEN_SECRET).toString("base64");
	private readonly sessionLimit = ONE_DAY_IN_SECONDS;

	public login(payload: PayloadSchema) {
		const token = sign(payload, this.secret, {
			expiresIn: this.sessionLimit,
		});

		cookies().set({
			name: this.cookieName,
			value: token,
			maxAge: this.sessionLimit,
			httpOnly: true,
		});
	}

	public logout() {
		cookies().delete(this.cookieName);
	}

	private getPayload(): PayloadSchema {
		const cookie = cookies().get(this.cookieName);
		if (!cookie) throw new Error("Without cookie");
		const payload = verify(cookie.value, this.secret);
		return payloadSchema.parse(payload);
	}

	public async getSession(): Promise<User> {
		const payload = this.getPayload();

		const userRepository = new UserRepository();
		return userRepository.findByNickname(payload.nickname);
	}
}
