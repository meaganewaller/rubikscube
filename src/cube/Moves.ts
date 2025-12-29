import type { Face, Facelets } from "./CubeState";

const ROT_CW = [6, 3, 0, 7, 4, 1, 8, 5, 2]; // new[i] = old[ROT_CW[i]]

function rotateFaceCW(arr: string[]) {
	const copy = arr.slice();
	for (let i = 0; i < 9; i++) arr[i] = copy[ROT_CW[i]];
}

function cycle4(
	s: Facelets,
	a: [Face, number[]],
	b: [Face, number[]],
	c: [Face, number[]],
	d: [Face, number[]],
) {
	const [fa, ia] = a;
	const [fb, ib] = b;
	const [fc, ic] = c;
	const [fd, id] = d;
	const temp = ia.map((i) => s[fa][i]);
	ia.forEach((i, k) => {
		s[fa][i] = s[fd][id[k]];
	});
	id.forEach((i, k) => {
		s[fd][i] = s[fc][ic[k]];
	});
	ic.forEach((i, k) => {
		s[fc][i] = s[fb][ib[k]];
	});
	ib.forEach((i, k) => {
		s[fb][i] = temp[k];
	});
}

/**
 * Apply a single clockwise quarter-turn: "U", "R", etc.
 * You’ll add prime and double by calling this multiple times.
 */
export function turnCW(s: Facelets, face: Face) {
	rotateFaceCW(s[face]);

	// Edge cycles (standard facelet indexing):
	// 0 1 2
	// 3 4 5
	// 6 7 8

	switch (face) {
		case "U":
			cycle4(
				s,
				["F", [0, 1, 2]],
				["R", [0, 1, 2]],
				["B", [0, 1, 2]],
				["L", [0, 1, 2]],
			);
			break;

		case "D":
			cycle4(
				s,
				["F", [6, 7, 8]],
				["L", [6, 7, 8]],
				["B", [6, 7, 8]],
				["R", [6, 7, 8]],
			);
			break;

		case "F":
			cycle4(
				s,
				["U", [6, 7, 8]],
				["R", [0, 3, 6]],
				["D", [2, 1, 0]],
				["L", [8, 5, 2]],
			);
			break;

		case "B":
			cycle4(
				s,
				["U", [2, 1, 0]],
				["L", [0, 3, 6]],
				["D", [6, 7, 8]],
				["R", [8, 5, 2]],
			);
			break;

		case "R":
			cycle4(
				s,
				["U", [2, 5, 8]],
				["B", [6, 3, 0]],
				["D", [2, 5, 8]],
				["F", [2, 5, 8]],
			);
			break;

		case "L":
			cycle4(
				s,
				["U", [0, 3, 6]],
				["F", [0, 3, 6]],
				["D", [0, 3, 6]],
				["B", [8, 5, 2]],
			);
			break;
	}
}

export function applyMove(s: Facelets, move: string) {
	// "R", "R'", "R2"
	const face = move[0] as Face;
	const suffix = move.slice(1);
	if (!["U", "D", "L", "R", "F", "B"].includes(face))
		throw new Error(`Bad move: ${move}`);

	if (suffix === "") turnCW(s, face);
	else if (suffix === "'") {
		turnCW(s, face);
		turnCW(s, face);
		turnCW(s, face);
	} else if (suffix === "2") {
		turnCW(s, face);
		turnCW(s, face);
	} else throw new Error(`Bad move: ${move}`);
}
