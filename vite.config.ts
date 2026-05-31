import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

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
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ZAMSTATE Real Estate',
        short_name: 'ZAMSTATE',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          { src: '/house-keyw.png', sizes: '192x192', type: 'image/png' },
          { src: '/house-key.jpg', sizes: '512x512', type: 'image/jpg' }
        ]
      },
      workbox: {
        navigateFallback: '/',
      }
    })
  ]
});
