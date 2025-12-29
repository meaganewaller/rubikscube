export type Move = string;

export class MoveQueue {
	private queue: Move[] = [];
	private running = false;

	enqueue(move: Move) {
		this.queue.push(move);
	}

	async run(handler: (move: Move) => Promise<void>) {
		if (this.running) return;
		this.running = true;

		while (this.queue.length) {
			const move = this.queue.shift();
			if (move === undefined) continue;
			await handler(move);
		}

		this.running = false;
	}
}
