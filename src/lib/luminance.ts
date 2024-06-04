export function isTextWhite(hex: string): boolean {
	const hexWithoutHash = hex.replace("#", "");

	const r = Number.parseInt(hexWithoutHash.substring(0, 2), 16) / 255;
	const g = Number.parseInt(hexWithoutHash.substring(2, 4), 16) / 255;
	const b = Number.parseInt(hexWithoutHash.substring(4, 6), 16) / 255;

	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

	return luminance < 0.5;
}
