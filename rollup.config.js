import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'

// 将所有外部依赖列出，避免打包进最终产物
const external = [
  'vite',
  'chalk',
  // Babel 相关（设为 external，由用户环境提供）
  '@babel/parser',
  '@babel/traverse',
  '@babel/types',
  '@babel/core',
  // Node.js 内置模块（如果在浏览器环境使用不需要）
  'fs',
  'path',
  'crypto'
]

// 通用插件配置
const plugins = [
  json(),
  resolve({
    browser: true, // 优先使用浏览器版本
    preferBuiltins: false // 不优先使用 Node.js 内置模块
  }),
  commonjs(),
  typescript({ 
    tsconfig: './tsconfig.json',
    declaration: false, // 禁用 typescript 插件的声明生成，由 dts 插件统一处理
    target: 'ES2018', // 现代化目标，减少 polyfill
    importHelpers: true // 使用 tslib 减少重复代码
  })
]

// 生产环境额外优化
const productionPlugins = [
  terser({
    compress: {
      drop_console: true, // 移除 console（可选）
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info'], // 移除指定函数调用
      passes: 2 // 多次压缩优化
    },
    mangle: {
      toplevel: true, // 混淆顶级作用域变量
      properties: {
        // 可选：混淆属性名（需谨慎，可能破坏 API）
        // regex: /^_/ // 只混淆下划线开头的属性
      }
    },
    format: {
      comments: false // 移除注释
    }
  })
]

export default [
  // ESM 格式（支持 Tree-shaking）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true, // 生成 source map 便于调试
      preserveModules: false // 不保留模块结构，便于压缩
    },
    external,
    plugins: [
      ...plugins,
      ...productionPlugins
    ],
    // 明确标记为 sideEffects: false 便于 Tree-shaking
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    }
  },
  
  // CommonJS 格式（兼容旧环境）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    external,
    plugins: [
      ...plugins,
      ...productionPlugins
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    }
  },
  
  // 类型声明文件
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'esm' },
    plugins: [dts()],
    external
  }
]
