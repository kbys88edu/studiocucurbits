import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  srcDir: './tests/astro-pages',
  trailingSlash: 'always',
});
