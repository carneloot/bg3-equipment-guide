import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://bg3.carneloot.com",
  vite: {
    server: {
      allowedHosts: [".onamp.dev"],
    },
  },
});
