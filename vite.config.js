import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // MUST match the GitHub Pages URL path (note the lowercase t)
  base: "/trustV2/",
  build: {
    outDir: "docs",   // Vite will put the built site here
  },
});
