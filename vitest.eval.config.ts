import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The live grounded-answer eval (US-034). Kept apart from vitest.config.ts so `npm test` never calls the model.
export default defineConfig({
  test: {
    include: ["tests/eval/run.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
