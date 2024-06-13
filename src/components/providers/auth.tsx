"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { type FC, type PropsWithChildren, useEffect } from "react";
import { useBoolean } from "usehooks-ts";

interface Props {
	mode: "auto" | "authenticated" | "unauthenticated";
}

export const AuthProviderComponent: FC<PropsWithChildren<Props>> = ({
	children,
	mode,
}) => {
	const authStore = useAuthStore();
	const isLoading = useBoolean(true);
	const router = useRouter();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		(async () => {
			const response = await fetch("/api/session");

			if (response.status === 200) {
				if (mode !== "authenticated") return router.push("/");
				const data = await response.json();
				authStore.setSession(data);
			} else if (mode !== "unauthenticated") return router.push("/login");

			isLoading.setFalse();
		})().catch(async (err) => {
			console.error(err);
			await authStore.logout();
			router.refresh();
		});
	}, []);

	return isLoading.value ? null : <>{children}</>;
};
