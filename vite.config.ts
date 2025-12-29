import { defineConfig } from "vite";

export default defineConfig({
	server: {
		open: true,
	},

	build: {
		target: "es2022",
		sourcemap: true,
	},

	esbuild: {
		target: "es2022",
	},

	resolve: {
		alias: {
			"@": "/src",
		},
	},
});
