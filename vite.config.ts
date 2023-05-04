import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import rust from "./src/plugin";

export default defineConfig({
	plugins: [wasm(), rust()],
	assetsInclude: [".wasm"],
});
