import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        main:         resolve(__dirname, "index.html"),
        instructions: resolve(__dirname, "instructions.html"),
        quest:        resolve(__dirname, "quest.html"),
        game:         resolve(__dirname, "game.html"),
        won:          resolve(__dirname, "won.html"),
      }
    }
  }
});