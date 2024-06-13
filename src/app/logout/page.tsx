"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
	const authStore = useAuthStore();
	const router = useRouter();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		authStore.logout().finally(() => {
			router.push("/login");
		});
	}, []);

	return null;
}
