import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: "base" must match your GitHub repository name exactly.
// Your repo is github.com/Ricardoaalves114/Titan-Le-a-, so it's set below.
// If you rename the repo, update this value to match.
export default defineConfig({
  plugins: [react()],
  base: "/Titan-Le-a-/",
});
