import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020
      }
    },
    rules: {
      // TypeScript 特定规则
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      
      // 通用规则
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }]
    },
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/'
    ]
  },
  {
    files: ['src/utils/optimizeTips.ts', 'src/utils/reportGenerator.ts'],
    rules: {
      'no-console': 'off' // 允许优化提示和报告生成文件中使用 console.log
    }
  },
  {
    files: ['src/core/codeScanner.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off', // 允许动态 require Babel 包
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' // 允许下划线前缀的未使用变量
      }]
    }
  },
  {
    files: ['src/plugins/vite-plugin.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { 
        varsIgnorePattern: '^_' // 允许下划线前缀的未使用变量
      }]
    }
  }
]
