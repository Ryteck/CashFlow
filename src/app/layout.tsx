import "@/styles/tailwind.css";
import "react-color-palette/css";

import { QueryProviderComponent } from "@/components/providers/query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import type { FC, PropsWithChildren } from "react";

export const metadata: Metadata = {
	title: "CashFlow",
	description: "Ryteck CashFlow",
};

const Layout: FC<PropsWithChildren> = ({ children }) => (
	<html lang="pt-BR">
		<body>
			<QueryProviderComponent>
				<ScrollArea className="w-screen h-screen">
					{children}

					<ScrollBar orientation="vertical" />
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</QueryProviderComponent>

			<Toaster theme="light" richColors />
		</body>
	</html>
);

export default Layout;
