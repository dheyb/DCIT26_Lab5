import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/dheybg/", // <-- Changed this to match your repository name
  plugins: [react(), tailwindcss()],
});