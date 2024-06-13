import { HeaderComponent } from "@/components/header";
import { AuthProviderComponent } from "@/components/providers/auth";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
	return (
		<AuthProviderComponent mode="authenticated">
			<div className="flex flex-col">
				<HeaderComponent />
				{children}
			</div>
		</AuthProviderComponent>
	);
}
