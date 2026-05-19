import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

// 将所有外部依赖列出，避免打包进最终产物
const external = [
  'vite',
  'webpack',
  'terser-webpack-plugin',
  'chalk'
]

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.cjs', format: 'cjs', exports: 'named' },
      { file: 'dist/index.esm.js', format: 'esm' }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: false // 禁用 typescript 插件的声明生成，由 dts 插件统一处理
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'esm' },
    plugins: [dts()],
    external
  }
]
