import "@/styles/tailwind.css";

import type { Metadata } from "next";
import type { FC, PropsWithChildren } from "react";

export const metadata: Metadata = {
	title: "CashFlow",
	description: "Ryteck CashFlow",
};

const Layout: FC<PropsWithChildren> = ({ children }) => (
	<html lang="en">
		<body>{children}</body>
	</html>
);

export default Layout;
