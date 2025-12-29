import * as THREE from "three";
import type { Color, Face, Facelets } from "../cube/CubeState";

const SPACING = 1.05;

// BoxGeometry material index order:
// 0:+X (R), 1:-X (L), 2:+Y (U), 3:-Y (D), 4:+Z (F), 5:-Z (B)
const FACE_TO_MAT_INDEX: Record<Face, number> = {
  R: 0,
  L: 1,
  U: 2,
  D: 3,
  F: 4,
  B: 5,
};

const COLOR_HEX: Record<Color, number> = {
  W: 0xffffff,
  Y: 0xffd500,
  O: 0xff7a00,
  R: 0xd00000,
  G: 0x00a650,
  B: 0x0051ff,
};

const PLASTIC_HEX = 0x111111;

type Coord = { x: -1 | 0 | 1; y: -1 | 0 | 1; z: -1 | 0 | 1 };

function isCoord(v: number): v is -1 | 0 | 1 {
  return v === -1 || v === 0 || v === 1;
}

/**
 * Facelet indexing convention (0..8):
 * 0 1 2
 * 3 4 5
 * 6 7 8
 *
 * We assume standard cube orientation:
 * - +X is R, -X is L
 * - +Y is U, -Y is D
 * - +Z is F, -Z is B
 *
 * And face "view" orientations:
 * - F: top is +Y, left is -X
 * - B: top is +Y, left is +X (because you're facing -Z)
 * - U: top is -Z (back), left is -X
 * - D: top is +Z (front), left is -X
 * - R: top is +Y, left is +Z (front)
 * - L: top is +Y, left is -Z (back)
 */
function faceletIndex(face: Face, c: Coord): number {
  const { x, y, z } = c;

  let row = 0;
  let col = 0;

  switch (face) {
    case "F": {
      // z = +1
      row = 1 - y;     // y: 1->0, 0->1, -1->2
      col = x + 1;     // x: -1->0, 0->1, 1->2
      break;
    }
    case "B": {
      // z = -1 (facing -Z flips left/right)
      row = 1 - y;
      col = 1 - x;     // x: 1->0, 0->1, -1->2
      break;
    }
    case "U": {
      // y = +1 (top view: top row is back, i.e. z=-1)
      row = z + 1;     // z: -1->0, 0->1, 1->2
      col = x + 1;
      break;
    }
    case "D": {
      // y = -1 (bottom view: top row is front, i.e. z=+1)
      row = 1 - z;     // z: 1->0, 0->1, -1->2
      col = x + 1;
      break;
    }
    case "R": {
      // x = +1 (right view: left side is front, i.e. z=+1)
      row = 1 - y;
      col = 1 - z;     // z: 1->0 (front), 0->1, -1->2 (back)
      break;
    }
    case "L": {
      // x = -1 (left view: left side is back, i.e. z=-1)
      row = 1 - y;
      col = z + 1;     // z: -1->0 (back), 0->1, 1->2 (front)
      break;
    }
  }

  // row/col should be 0..2 if we're on that face
  return row * 3 + col;
}

function setMatColor(mesh: THREE.Mesh, matIndex: number, hex: number) {
  const mats = mesh.material;
  if (!Array.isArray(mats)) return;

  const mat = mats[matIndex];
  if (!mat) return;

  // Ensure it's a material with a 'color' property (MeshStandardMaterial etc.)
  const anyMat = mat as unknown as { color?: THREE.Color };
  if (!anyMat.color) return;

  anyMat.color.setHex(hex);
}

export class CubeMesh {
  root = new THREE.Group();
  cubelets: THREE.Mesh[] = [];

  constructor() {
    const geom = new THREE.BoxGeometry(1, 1, 1);

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const mats = Array.from({ length: 6 }, () =>
            new THREE.MeshStandardMaterial({ color: PLASTIC_HEX })
          );

          const mesh = new THREE.Mesh(geom, mats);
          mesh.position.set(x * SPACING, y * SPACING, z * SPACING);

          if (!isCoord(x) || !isCoord(y) || !isCoord(z)) {
            throw new Error("Unexpected coord outside -1..1");
          }

          mesh.userData.coord = { x, y, z } satisfies Coord;

          this.root.add(mesh);
          this.cubelets.push(mesh);
        }
      }
    }
  }

  syncFromState(state: Facelets) {
    for (const mesh of this.cubelets) {
      const c = mesh.userData.coord as Coord;

      // Reset all faces to plastic each sync
      for (let i = 0; i < 6; i++) setMatColor(mesh, i, PLASTIC_HEX);

      // Paint stickers only on visible outer faces

      if (c.x === 1) {
        const idx = faceletIndex("R", c);
        setMatColor(mesh, FACE_TO_MAT_INDEX.R, COLOR_HEX[state.R[idx]]);
      }
      if (c.x === -1) {
        const idx = faceletIndex("L", c);
        setMatColor(mesh, FACE_TO_MAT_INDEX.L, COLOR_HEX[state.L[idx]]);
      }
      if (c.y === 1) {
        const idx = faceletIndex("U", c);
        setMatColor(mesh, FACE_TO_MAT_INDEX.U, COLOR_HEX[state.U[idx]]);
      }
      if (c.y === -1) {
        const idx = faceletIndex("D", c);
        setMatColor(mesh, FACE_TO_MAT_INDEX.D, COLOR_HEX[state.D[idx]]);
      }
      if (c.z === 1) {
        const idx = faceletIndex("F", c);
        setMatColor(mesh, FACE_TO_MAT_INDEX.F, COLOR_HEX[state.F[idx]]);
      }
      if (c.z === -1) {
        const idx = faceletIndex("B", c);
        setMatColor(mesh, FACE_TO_MAT_INDEX.B, COLOR_HEX[state.B[idx]]);
      }
    }
  }
}
