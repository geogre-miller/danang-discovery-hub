import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  build: {
    // Increase chunk size warning limit to 1000kb (from default 500kb)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            
            // Charts and visualization
            if (id.includes('recharts') || id.includes('d3-') || id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'chart-vendor';
            }
            
            // Form handling
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            
            // Query and data fetching
            if (id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'query-vendor';
            }
            
            // Date utilities
            if (id.includes('date-fns') || id.includes('react-day-picker')) {
              return 'date-vendor';
            }
            
            // Utility libraries
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils-vendor';
            }
            
            // Other smaller vendor libraries
            return 'vendor';
          }
          
          // Application chunks
          if (id.includes('/src/pages/')) {
            return 'pages';
          }
          
          if (id.includes('/src/components/ui/')) {
            return 'ui-components';
          }
          
          if (id.includes('/src/components/')) {
            return 'components';
          }
          
          if (id.includes('/src/hooks/') || id.includes('/src/lib/') || id.includes('/src/services/')) {
            return 'utils';
          }
        },
      },
    },
    // Enable source maps for better debugging in production
    sourcemap: mode === 'development',
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'framer-motion'
      ],
    },
  },
}));
