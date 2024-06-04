// biome-ignore lint/suspicious/noExplicitAny:
type DebounceFunction = (...args: any[]) => void;

export function debounceFactory<T extends DebounceFunction>(func: T): T {
	let timeout: NodeJS.Timeout | null = null;

	const debouncedFunction = (...args: Parameters<T>): void => {
		if (timeout !== null) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), 300);
	};

	return debouncedFunction as T;
}
