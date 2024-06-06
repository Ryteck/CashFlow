"use client";

import { debounceFactory } from "@/lib/debounce";
import { type FC, useEffect } from "react";
import { ColorPicker, useColor } from "react-color-palette";

interface Props {
	value: string;
	onChange: (value: string) => void;
}

export const ColorPickerComponent: FC<Props> = ({ value, onChange }) => {
	const [selColor, setSelColor] = useColor(value);

	const debounceOnChange = debounceFactory(onChange);

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		debounceOnChange(selColor.hex.substring(0, 7));
	}, [selColor]);

	return <ColorPicker color={selColor} onChange={setSelColor} hideAlpha />;
};
