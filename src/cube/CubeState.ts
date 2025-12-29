export type Face = "U" | "D" | "L" | "R" | "F" | "B";
export type Color = "W" | "Y" | "O" | "R" | "G" | "B";

export type Facelets = Record<Face, Color[]>;

export function solved(): Facelets {
	return {
		U: Array(9).fill("W"),
		D: Array(9).fill("Y"),
		L: Array(9).fill("O"),
		R: Array(9).fill("R"),
		F: Array(9).fill("G"),
		B: Array(9).fill("B"),
	};
}
