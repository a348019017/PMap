

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import uglify from '@lopatnov/rollup-plugin-uglify';
import obfuscator from 'rollup-plugin-obfuscator';
//import pkg from './package.json'  assert { type: "json" };


export default {
    input: ["src/RZPrimitiveX.js"],
    output: [
        {
            name:"pmap_rz",
            dir: "dist",
            entryFileNames: "[name].js",
            //file: pkg.browser,
            format: "umd",
            exports: "named"
        }
    ],
    plugins: [
        resolve(),commonjs(),terser(),uglify(),obfuscator()
    ],
    // plugins: [
    //     resolve(),commonjs()
    // ],
    external: []
};
