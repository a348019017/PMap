import { fileURLToPath, URL } from 'node:url'


import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue2 from '@vitejs/plugin-vue2'
import { imageRequirePlugin } from 'vite-plugin-image-require'
const path = require('path')
import  nodeResolve  from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';



const config = {
  leaflet: {
    entry: path.resolve(__dirname, "./src/lib/llindex.js"),
    fileName: "llindex.js",
  },
  mapboxgl: {
    entry: path.resolve(__dirname, "./src/lib/glindex.js"),
    fileName: "glindex.js",
  },
  test: {
    entry: path.resolve(__dirname, "./src/vectortile/bundle.js"),
    fileName: "lvs.js",
  },
};


const currentConfig = config[process.env.LIB_NAME];

if (currentConfig === undefined) {
  throw new Error('LIB_NAME is not defined or is not valid ' + console.log(process.env.LIB_NAME));
} else {
  console.log("LIB_NAME is defined")
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2(),
    imageRequirePlugin(),
    nodeResolve(),
    commonjs()
    // legacy({
    //   targets: ['ie >= 11'],
    //   additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    // })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      ...currentConfig,
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


