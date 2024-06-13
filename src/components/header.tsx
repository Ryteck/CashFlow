"use client";

import { BudgetFormComponent } from "@/components/form/budget";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { FC } from "react";

export const HeaderComponent: FC = () => {
	const pathname = usePathname();

	const defaultMonthDiff = 6;

	const dashboardDateDefault = new Date();

	dashboardDateDefault.setMinutes(0);
	dashboardDateDefault.setSeconds(0);
	dashboardDateDefault.setMilliseconds(0);

	dashboardDateDefault.setMonth(
		dashboardDateDefault.getMonth() - defaultMonthDiff,
	);

	const startDateDefault = encodeURIComponent(
		dashboardDateDefault.toISOString(),
	);

	const router = useRouter();

	return (
		<header className="flex gap-2 p-4 border-b-2 border-dashed">
			<Link
				style={{ cursor: pathname === "/" ? "auto" : "pointer" }}
				href={`/?startDate=${startDateDefault}`}
			>
				<Button disabled={pathname === "/"}>Dashboard</Button>
			</Link>

			<Link
				style={{ cursor: pathname === "/category" ? "auto" : "pointer" }}
				href={"/category"}
			>
				<Button disabled={pathname === "/category"}>Categorias</Button>
			</Link>

			<div className="ml-auto">
				<BudgetFormComponent disableTrigger={pathname !== "/"} />
			</div>

			<Sheet>
				<SheetTrigger asChild>
					<Button size="icon" variant="outline">
						<MenuIcon />
					</Button>
				</SheetTrigger>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>CashFlow</SheetTitle>
						<SheetDescription>
							Fiz esse programa só pra ser melhor que o excel da Patrícia,
							hehehe. Bjs...
						</SheetDescription>
					</SheetHeader>

					<SheetFooter>
						<Button
							className="w-full"
							variant="destructive"
							onClick={() => {
								router.push("/logout");
							}}
						>
							Deslogar
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</header>
	);
};
