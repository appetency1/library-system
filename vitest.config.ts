import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["server/test/**/*.test.ts"],
    exclude: ["**/.worktrees/**", "dist/**", "node_modules/**"]
  }
});
