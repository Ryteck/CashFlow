import type { User } from "@prisma/client";
import { create } from "zustand";

interface AuthStore {
	session: null | User;
	getSession: () => User;
	setSession: (session: User) => void;
	logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((setState, getState) => ({
	session: null,

	getSession: () => {
		const { session } = getState();
		if (session === null) throw new Error("Session is null");
		return session;
	},

	setSession: (session) => setState({ session }),

	async logout() {
		await fetch("/api/logout", { method: "POST" });
		setState({ session: null });
	},
}));
