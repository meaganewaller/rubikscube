import * as THREE from "three";

export type Axis = "x" | "y" | "z";

export class TurnAnimator {
	private tempGroup = new THREE.Group();

	constructor(private root: THREE.Group) {}

	async turn(axis: Axis, layer: number, dir: 1 | -1, duration = 200) {
		const axisVec =
			axis === "x"
				? new THREE.Vector3(1, 0, 0)
				: axis === "y"
					? new THREE.Vector3(0, 1, 0)
					: new THREE.Vector3(0, 0, 1);

		const cubelets = this.root.children.filter((c) => {
			const v = (c as THREE.Mesh).userData.coord?.[axis];
			return v === layer;
		}) as THREE.Mesh[];

		if (!cubelets.length) return;

		// re-parent
		this.root.add(this.tempGroup);
		cubelets.forEach((c) => {
			this.tempGroup.add(c);
		});

		const start = performance.now();
		const angle = (Math.PI / 2) * dir;

		return new Promise<void>((resolve) => {
			const tick = (now: number) => {
				const t = Math.min((now - start) / duration, 1);
				this.tempGroup.setRotationFromAxisAngle(axisVec, angle * t);

				if (t < 1) {
					requestAnimationFrame(tick);
				} else {
					// snap final rotation
					this.tempGroup.setRotationFromAxisAngle(axisVec, angle);

					// re-parent back
					cubelets.forEach((c) => {
						c.applyMatrix4(this.tempGroup.matrix);
						this.root.add(c);
					});

					this.tempGroup.clear();
					this.tempGroup.rotation.set(0, 0, 0);
					this.tempGroup.updateMatrix();

					resolve();
				}
			};

			requestAnimationFrame(tick);
		});
	}
}
