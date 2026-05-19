# Vite 项目集成指南

本文档详细说明如何在 Vite 项目中集成 `front-universal-optimizer`。

## 📋 目录

- [快速开始](#快速开始)
- [基础配置](#基础配置)
- [细粒度分包配置](#细粒度分包配置)
- [Console 清理配置](#console-清理配置)
- [CSP 安全策略](#csp-安全策略)
- [完整生产环境配置](#完整生产环境配置)
- [React 项目配置](#react-项目配置)
- [Vue 项目配置](#vue-项目配置)
- [业务代码中使用 Hooks](#业务代码中使用-hooks)
- [常见问题](#常见问题)

---

## 快速开始

### 1. 安装依赖

```bash
npm install front-universal-optimizer
```

### 2. 基础配置（vite.config.ts）

```typescript
import { defineConfig } from 'vite'
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  enableAllOpt: true
})

export default defineConfig({
  plugins: [optimizer.vitePlugin]
})
```

---

## 基础配置

### 开发环境配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // 或 react()
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: 'development',
  enableAllOpt: true,  // 一键开启所有优化建议
  
  // 开发环境关闭生产优化
  clearConsole: false,
  enableCSP: false
})

export default defineConfig({
  plugins: [
    vue(),
    optimizer.vitePlugin
  ]
})
```

### 生产环境配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createCodeOptimizer } from 'front-universal-optimizer'

const isProd = process.env.NODE_ENV === 'production'

const optimizer = createCodeOptimizer({
  env: isProd ? 'production' : 'development',
  
  // 编译层优化
  chunkSplit: true,
  clearConsole: isProd,
  brotliCompress: isProd,
  
  // 安全防护
  enableCSP: isProd
})

export default defineConfig({
  plugins: [
    vue(),
    optimizer.vitePlugin
  ],
  build: {
    sourcemap: !isProd,
    minify: isProd ? 'terser' : false
  }
})
```

---

## 细粒度分包配置

### 默认细粒度分包

自动将第三方库按类型分拆，提升缓存命中率：

```typescript
const optimizer = createCodeOptimizer({
  chunkSplit: {
    enable: true,
    strategy: 'fine-grained',  // 细粒度策略
    maxInitialSize: 244 * 1024,  // 244kb
    maxAsyncSize: 244 * 1024
  }
})
```

**生成的 chunks**：
- `vendor-react.js` - React 核心库
- `vendor-vue.js` - Vue 核心库
- `vendor-lodash.js` - Lodash/Underscore
- `vendor-http.js` - Axios/Fetch
- `vendor-date.js` - Moment/Dayjs/Date-fns
- `vendor.js` - 其他第三方库

### 自定义分包规则

```typescript
const optimizer = createCodeOptimizer({
  chunkSplit: {
    enable: true,
    strategy: 'custom',
    customRules: {
      // UI 组件库单独打包
      'vendor-ui': (id) => 
        id.includes('antd') || 
        id.includes('element-plus') ||
        id.includes('naive-ui'),
      
      // 图表库单独打包
      'vendor-charts': (id) => 
        id.includes('echarts') || 
        id.includes('chart.js') ||
        id.includes('d3'),
      
      // 编辑器单独打包
      'vendor-editor': (id) => 
        id.includes('tinymce') || 
        id.includes('quill') ||
        id.includes('monaco-editor'),
      
      // 工具库单独打包
      'vendor-utils': (id) => 
        id.includes('lodash') || 
        id.includes('ramda')
    }
  }
})
```

### 性能对比

| 策略 | 首屏加载 | 缓存命中 | 增量更新 |
|------|---------|---------|---------|
| 单一 vendor | 2.5s | 低 | 全量下载 |
| 细粒度分包 | 1.8s | 高 | 按需下载 |
| 自定义分包 | 1.5s | 最高 | 精确控制 |

---

## Console 清理配置

### 方式一：Babel 插件（推荐）

#### 1. 安装 Babel 插件

```bash
npm install @babel/core @babel/plugin-transform-remove-console --save-dev
```

#### 2. 配置 Babel

创建 `babel.config.js`：

```javascript
module.exports = {
  plugins: [
    ['@babel/plugin-transform-remove-console', {
      exclude: ['error', 'warn']  // 保留 error 和 warn
    }]
  ]
}
```

#### 3. 启用插件

```typescript
const optimizer = createCodeOptimizer({
  env: 'production',
  clearConsole: true,
  consoleRemovalStrategy: 'babel'  // 默认值
})
```

**优势**：
- ✅ 正确处理嵌套括号和多行代码
- ✅ 支持条件性保留（如保留 error/warn）
- ✅ 不会破坏代码结构
- ✅ 成熟的解决方案

### 方式二：正则替换（简单场景）

```typescript
const optimizer = createCodeOptimizer({
  env: 'production',
  clearConsole: true,
  consoleRemovalStrategy: 'regex'  // 简单正则替换
})
```

**注意**：正则替换可能无法处理复杂情况，仅建议在简单项目中使用。

### 效果对比

```typescript
// 原始代码
console.log('debug info')
console.warn('warning')
console.error('error message')
console.log(
  'multi line',
  someFunction(a, b)
)

// Babel 处理后（exclude: ['error', 'warn']）
// console.log('debug info') - 已删除
console.warn('warning')  // 保留
console.error('error message')  // 保留
// console.log(...) - 已删除

// 正则处理后
// 可能留下空行或语法错误
```

---

## CSP 安全策略

### 基础配置

```typescript
const optimizer = createCodeOptimizer({
  enableCSP: true,
  cspPolicy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
})
```

### 常用 CSP 配置

#### 严格模式（推荐生产环境）

```typescript
cspPolicy: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'"
```

#### 宽松模式（开发环境）

```typescript
cspPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:"
```

#### CDN 支持

```typescript
cspPolicy: "default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://api.example.com"
```

#### 内联脚本支持

```typescript
cspPolicy: "default-src 'self'; script-src 'self' 'nonce-rAnd0m'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
```

然后在 HTML 中使用 nonce：

```html
<script nonce="rAnd0m">
  // 内联脚本
</script>
```

---

## 完整生产环境配置

### Vue 3 项目

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createCodeOptimizer } from 'front-universal-optimizer'

const isProd = process.env.NODE_ENV === 'production'

const optimizer = createCodeOptimizer({
  env: isProd ? 'production' : 'development',
  
  // 编译层优化
  chunkSplit: {
    enable: isProd,
    strategy: 'fine-grained',
    customRules: {
      'vendor-element': (id) => id.includes('element-plus'),
      'vendor-echarts': (id) => id.includes('echarts')
    }
  },
  clearConsole: isProd,
  consoleRemovalStrategy: 'babel',
  brotliCompress: isProd,
  
  // 安全防护
  enableCSP: isProd,
  cspPolicy: isProd 
    ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://api.example.com"
    : undefined,
  
  // 性能优化
  resourcePreload: true,
  domPrefetch: true
})

export default defineConfig({
  plugins: [
    vue(),
    optimizer.vitePlugin
  ],
  build: {
    sourcemap: !isProd,
    minify: isProd ? 'terser' : false,
    terserOptions: isProd ? {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    } : undefined,
    rollupOptions: {
      output: {
        chunkFileNames: isProd ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
        entryFileNames: isProd ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
        assetFileNames: isProd ? 'assets/[ext]/[name]-[hash].[ext]' : 'assets/[ext]/[name].[ext]'
      }
    }
  }
})
```

### React 项目

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createCodeOptimizer } from 'front-universal-optimizer'

const isProd = process.env.NODE_ENV === 'production'

const optimizer = createCodeOptimizer({
  env: isProd ? 'production' : 'development',
  
  chunkSplit: {
    enable: isProd,
    strategy: 'fine-grained',
    customRules: {
      'vendor-antd': (id) => id.includes('antd'),
      'vendor-redux': (id) => id.includes('redux') || id.includes('@reduxjs')
    }
  },
  clearConsole: isProd,
  consoleRemovalStrategy: 'babel',
  brotliCompress: isProd,
  
  enableCSP: isProd,
  cspPolicy: isProd 
    ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://api.example.com"
    : undefined
})

export default defineConfig({
  plugins: [
    react(),
    optimizer.vitePlugin
  ],
  build: {
    sourcemap: !isProd,
    minify: isProd ? 'terser' : false
  }
})
```

---

## 业务代码中使用 Hooks

### useDebounce - 防抖

```typescript
import { useDebounce } from 'front-universal-optimizer'

function SearchComponent() {
  const [keyword, setKeyword] = useState('')
  
  // 防抖搜索（300ms）
  const debouncedSearch = useDebounce((searchTerm: string) => {
    fetchSearchResults(searchTerm)
  }, 300)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    debouncedSearch(value)
  }
  
  // 可以手动取消
  const handleCancel = () => {
    debouncedSearch.cancel()
  }
  
  return (
    <div>
      <input value={keyword} onChange={handleChange} />
      <button onClick={handleCancel}>取消</button>
    </div>
  )
}
```

### useThrottle - 节流

```typescript
import { useThrottle } from 'front-universal-optimizer'

function ScrollComponent() {
  const [position, setPosition] = useState(0)
  
  // 节流滚动处理（200ms）
  const throttledScroll = useThrottle(() => {
    setPosition(window.scrollY)
  }, 200)
  
  useEffect(() => {
    window.addEventListener('scroll', throttledScroll)
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [])
  
  return <div>Scroll Position: {position}</div>
}
```

### useAutoClear - 自动清理资源

```typescript
import { useAutoClear } from 'front-universal-optimizer'

function ResourceComponent() {
  const cleaner = useAutoClear()
  
  useEffect(() => {
    // 定时器
    const timer = setTimeout(() => {
      console.log('Done')
    }, 1000)
    cleaner.addTimer(timer)
    
    // 事件监听器
    const handler = () => console.log('Resize')
    window.addEventListener('resize', handler)
    cleaner.addCleanup(() => {
      window.removeEventListener('resize', handler)
    })
    
    // AbortController
    const controller = new AbortController()
    cleaner.addAbortController(controller)
    
    fetch('/api/data', { signal: controller.signal })
    
    // 组件卸载时自动清理所有资源
  }, [])
  
  return <div>Resource Component</div>
}
```

### useVirtualList - 虚拟列表

```typescript
import { useVirtualList } from 'front-universal-optimizer'

function VirtualListComponent() {
  // 生成 10000 条数据
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }))
  
  // 虚拟列表配置
  const { visibleList, totalHeight, scrollTo } = useVirtualList(
    data,
    { 
      itemHeight: 50,      // 每项高度
      visibleCount: 10,    // 可见数量
      bufferSize: 5        // 缓冲数量
    }
  )
  
  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: totalHeight }}>
        {visibleList.map(item => (
          <div 
            key={item.id}
            style={{ height: 50 }}
          >
            {item.name}
          </div>
        ))}
      </div>
      
      <button onClick={() => scrollTo(100)}>
        滚动到第 100 项
      </button>
    </div>
  )
}
```

---

## 常见问题

### Q1: 如何只启用部分功能？

```typescript
const optimizer = createCodeOptimizer({
  enableAllOpt: false,  // 关闭全部
  autoDebounce: true,   // 只启用防抖
  autoThrottle: true,   // 只启用节流
  virtualListAutoReg: true  // 只启用虚拟列表
})
```

### Q2: 如何禁用某个优化？

```typescript
const optimizer = createCodeOptimizer({
  enableAllOpt: true,
  enableCSP: false,     // 禁用 CSP
  safeStorage: false,   // 禁用安全存储
  clearConsole: false   // 禁用 console 清理
})
```

### Q3: SSR 环境如何使用？

```typescript
// server.js (Node.js)
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: 'production',
  safeStorage: true  // 会自动降级，不抛错
})

// 安全使用，无需特殊处理
optimizer.security.setSafeStorage('key', value)
optimizer.security.getSafeStorage('key')  // SSR 返回 null
```

### Q4: 如何查看优化建议？

```typescript
// main.ts / main.tsx
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: 'development',
  enableAllOpt: true
})

// 在控制台显示优化建议
optimizer.showOptimizationTips()
```

### Q5: 分包后如何分析 bundle？

使用 `rollup-plugin-visualizer`：

```bash
npm install rollup-plugin-visualizer --save-dev
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    optimizer.vitePlugin,
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

运行构建后会生成交互式图表，可视化分析各模块大小。

### Q6: 如何处理 TypeScript 类型？

库已包含完整的 TypeScript 类型定义：

```typescript
import { 
  createCodeOptimizer,
  OptimizeConfig,
  ChunkSplitConfig,
  useDebounce,
  useThrottle
} from 'front-universal-optimizer'

// 类型自动推断
const optimizer = createCodeOptimizer({
  env: 'production',
  chunkSplit: {
    enable: true,
    strategy: 'fine-grained'
  }
})

// Hover 查看完整类型定义
```

---

## 性能优化建议

### 1. 合理设置分包策略

- 小型项目：使用 `strategy: 'default'`
- 中型项目：使用 `strategy: 'fine-grained'`
- 大型项目：使用 `strategy: 'custom'` + 自定义规则

### 2. 启用 Brotli 压缩

```typescript
const optimizer = createCodeOptimizer({
  brotliCompress: true
})
```

配合 Nginx 配置：

```nginx
gzip on;
gzip_static on;
brotli on;
brotli_static on;
```

### 3. 使用资源预加载

```typescript
const optimizer = createCodeOptimizer({
  resourcePreload: true,
  domPrefetch: true
})
```

在 HTML 中自动添加：

```html
<link rel="preload" href="/assets/main.js" as="script">
<link rel="dns-prefetch" href="//api.example.com">
```

### 4. 监控性能指标

使用 Web Vitals：

```bash
npm install web-vitals
```

```typescript
import { getLCP, getFID, getCLS } from 'web-vitals'

getLCP(console.log)
getFID(console.log)
getCLS(console.log)
```

---

## 总结

通过本指南，你已经学会了：

✅ 基础配置和快速集成  
✅ 细粒度分包策略配置  
✅ Console 清理的两种方式  
✅ CSP 安全策略定制  
✅ 完整的生产环境配置  
✅ Hooks 工具的实际应用  
✅ 常见问题解决方案  

现在你可以在 Vite 项目中充分利用 `front-universal-optimizer` 提供的所有优化功能！

---

**更多文档**：
- [README.md](../README.md) - 完整功能说明
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 贡献指南
