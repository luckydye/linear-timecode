import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";
import rust from "./src/plugin";

export default defineConfig({
	plugins: [wasm(), rust(), solidPlugin()],
});
