import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { solved } from "../cube/CubeState";
import { MoveQueue } from "../cube/MoveQueue";
import { applyMove } from "../cube/Moves";
import { CubeMesh } from "../view/CubeMesh";
import { TurnAnimator } from "../view/TurnAnimator";

export class SceneApp {
	private renderer = new THREE.WebGLRenderer({ antialias: true });
	private scene = new THREE.Scene();
	private camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
	private controls!: OrbitControls;

	private cubeState = solved();
	private cubeMesh = new CubeMesh();
	private animator!: TurnAnimator;
	private moves = new MoveQueue();

	constructor(private mount: HTMLElement) {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.mount.appendChild(this.renderer.domElement);

		this.camera.position.set(5, 5, 7);
		this.scene.add(new THREE.AmbientLight(0xffffff, 1.1));

		const light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(6, 8, 4);
		this.scene.add(light);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;

		this.scene.add(this.cubeMesh.root);
		this.animator = new TurnAnimator(this.cubeMesh.root);

		window.addEventListener("resize", () => this.onResize());
		this.bindKeyboard();
	}

	start() {
		const tick = () => {
			this.controls.update();
			this.renderer.render(this.scene, this.camera);
			requestAnimationFrame(tick);
		};
		tick();
	}

	private bindKeyboard() {
		const map: Record<string, string> = {
			U: "U",
			R: "R",
			F: "F",
			L: "L",
			D: "D",
			B: "B",
		};

		window.addEventListener("keydown", (e) => {
			const key = e.key.toUpperCase();
			if (!map[key]) return;

			this.moves.enqueue(map[key]);
			this.moves.run(async (move) => {
				await this.animateMove(move);
				applyMove(this.cubeState, move);
				this.cubeMesh.syncFromState(this.cubeState);
			});
		});
	}

	private async animateMove(move: string) {
		const face = move[0];

		switch (face) {
			case "R":
				return this.animator.turn("x", 1, -1);
			case "L":
				return this.animator.turn("x", -1, 1);
			case "U":
				return this.animator.turn("y", 1, -1);
			case "D":
				return this.animator.turn("y", -1, 1);
			case "F":
				return this.animator.turn("z", 1, -1);
			case "B":
				return this.animator.turn("z", -1, 1);
		}
	}

	private onResize() {
		const w = window.innerWidth;
		const h = window.innerHeight;
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h);
	}
}
