import { AuthProviderComponent } from "@/components/providers/auth";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
	return (
		<AuthProviderComponent mode="unauthenticated">
			{children}
		</AuthProviderComponent>
	);
}
