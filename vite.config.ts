import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
});
