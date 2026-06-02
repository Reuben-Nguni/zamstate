import { defineConfig } from 'vite';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Ensure a web-compatible crypto is available for workbox / service worker generation
try {
  const nodeCrypto = require('crypto');
  if (!globalThis.crypto) {
    globalThis.crypto = nodeCrypto.webcrypto || nodeCrypto;
  }
} catch (e) {
  // fallback: leave as-is
}
const isProd = process.env.NODE_ENV === 'production';
const plugins = [];

// We use the static manifest and service worker in /public for PWA support.

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
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
    hmr: {
      overlay: true,
    },
  },
  plugins,
});
