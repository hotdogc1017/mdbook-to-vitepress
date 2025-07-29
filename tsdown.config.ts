import { defineConfig } from "tsdown";
import path from "node:path";

export default defineConfig({
  entry: "src/index.ts",
  alias: {
    "~/*": import.meta.dirname,
    "@": path.join(import.meta.dirname, "./src"),
  },
});
