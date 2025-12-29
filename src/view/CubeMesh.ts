import * as THREE from "three";
import type { Facelets } from "../cube/CubeState";

const SPACING = 1.05;

export class CubeMesh {
	root = new THREE.Group();
	cubelets: THREE.Mesh[] = [];

	constructor() {
		const geom = new THREE.BoxGeometry(1, 1, 1);

		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				for (let z = -1; z <= 1; z++) {
					const mats = Array.from(
						{ length: 6 },
						() => new THREE.MeshStandardMaterial({ color: 0x222222 }),
					);

					const mesh = new THREE.Mesh(geom, mats);
					mesh.position.set(x * SPACING, y * SPACING, z * SPACING);
					mesh.userData.coord = { x, y, z };

					this.root.add(mesh);
					this.cubelets.push(mesh);
				}
			}
		}
	}

	syncFromState(_state: Facelets) {
		// sticker mapping comes later
	}
}
