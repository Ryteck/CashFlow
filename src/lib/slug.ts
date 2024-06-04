export const generateSlug = (arg: string): string =>
	arg
		.normalize("NFD") // Normaliza
		.replace(/[\u0300-\u036f]/g, "") // Remove acentos
		.trim() // Remove espaços no início e no fim
		.toLowerCase() // Converte para minúsculas
		.replace(/\s+/g, "-") // Substitui espaços por hífens
		.replace(/[^\w\-]+/g, "") // Remove todos os caracteres não alfanuméricos exceto hífens
		.replace(/-+/g, "-") // Substitui múltiplos hífens por um único hífen
		.replace(/^-+/, "") // Remove hífens do início
		.replace(/-+$/, ""); // Remove hífens do final
