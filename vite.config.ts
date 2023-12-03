import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
	base: "/linear-timecode/dist"
	plugins: [solidPlugin()],
});
