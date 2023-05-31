import { fileURLToPath, URL } from 'node:url'
const path = require('path')
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue2 from '@vitejs/plugin-vue2'



const test= {
  entry: path.resolve(__dirname, "./src/index.js"),
  fileName: "index.js",
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2(),
    // legacy({
    //   targets: ['ie >= 11'],
    //   additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    // })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },build: {
    lib: {
      ...test,
      name: 'MyLib'
    },
    emptyOutDir: false,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
