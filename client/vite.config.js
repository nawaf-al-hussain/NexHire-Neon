import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['recharts', 'react', 'react-dom', 'react-router-dom'],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Only split vendor libs that are truly large and stable.
        // React is intentionally NOT split out because react-theme-switch-animation
        // declares react and react-dom as DEPENDENCIES (not just peerDeps), which
        // causes Vite to bundle a duplicate React inside DashboardShell's chunk,
        // breaking default-export resolution for any component that uses
        // react-theme-switch-animation. Keeping React in the main index chunk
        // and using optimizeDeps.include forces deduplication.
        manualChunks: {
          'charts-vendor': ['recharts'],
          'http-vendor': ['axios'],
          'icons-vendor': ['lucide-react'],
          // Isolate react-theme-switch-animation so its bundled React copy
          // doesn't pollute other chunks. The library is only used by
          // DashboardShell for the theme toggle animation.
          'theme-animation-vendor': ['react-theme-switch-animation'],
        },
      },
    },
  },
  // Ensure react-theme-switch-animation resolves to a single copy of React
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
