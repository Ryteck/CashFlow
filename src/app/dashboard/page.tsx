import { DashboardComponent } from "@/components/dashboard";
import { type FC, Suspense } from "react";

const Page: FC = () => (
	<Suspense>
		<DashboardComponent />
	</Suspense>
);

export default Page;
