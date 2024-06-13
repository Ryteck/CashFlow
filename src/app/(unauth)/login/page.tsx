"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	nickname: z.string().min(1, "Preencha o usuário"),
	password: z.string().min(1, "Preencha a senha"),
});

export default function Page() {
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nickname: "",
			password: "",
		},
	});

	const onSubmit = form.handleSubmit(async (data) => {
		const response = await fetch("/api/login", {
			method: "POST",
			body: JSON.stringify(data),
		});

		if (response.status === 200) router.push("/");
		else form.resetField("password");
	});

	return (
		<main className="w-screen h-screen flex">
			<Card className="m-auto w-80">
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription className="text-pretty">
						Preencha seu usuário e sua senha para prosseguir.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							id="login-form"
							onSubmit={onSubmit}
							className="flex-col flex gap-4"
						>
							<FormField
								control={form.control}
								name="nickname"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Usuário</FormLabel>
										<FormControl>
											<Input placeholder="Digite seu usuário" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Senha</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Digite sua senha"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<Button
						disabled={form.formState.isSubmitting}
						type="submit"
						form="login-form"
						className="w-full"
					>
						Login
					</Button>

					<Link href={"/register"}>Criar uma conta</Link>
				</CardFooter>
			</Card>
		</main>
	);
}
