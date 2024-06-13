import Repository from "@/domain/Repository";
import type { PayloadSchema } from "@/schemas/payload";
import type { User } from "@prisma/client";

export default class UserRepository extends Repository {
	public findByNickname(nickname: string): Promise<User> {
		return this.prismaClient.user.findUniqueOrThrow({
			where: { nickname },
		});
	}

	public store(data: Omit<User, "id">): Promise<User> {
		return this.prismaClient.user.create({ data });
	}
}
