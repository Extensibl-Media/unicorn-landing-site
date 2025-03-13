// @ts-check
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import netlify from "@astrojs/netlify";

import mdx from "@astrojs/mdx";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      // applyBaseStyles: false,
    }),
    mdx(),
  ],
  server: {
    host: "0.0.0.0",
  },
  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({ context: "client", access: "public" }),
      PUBLIC_SUPABASE_URL: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({
        context: "client",
        access: "public",
      }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
