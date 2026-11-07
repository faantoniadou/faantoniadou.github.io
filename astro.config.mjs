import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
// https://astro.build/config
export default defineConfig({
  site: "https://faantoniadou.github.io",
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react()]
});