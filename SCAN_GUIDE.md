# 🔍 智能代码扫描功能使用指南

front-universal-optimizer  now 具备**智能代码扫描**能力，可以自动分析您的项目代码，找出具体的性能优化点，并在终端中展示详细的报告。

---

## 🎯 核心特性

### ✅ 智能扫描 vs 传统提示

| 特性 | 传统提示 | 智能扫描 |
|------|---------|---------|
| 分析方式 | 固定模板 | AST 语法树分析 |
| 问题定位 | 通用建议 | **具体文件+行号** |
| 代码示例 | 固定示例 | **用户实际代码** |
| 优化建议 | 通用方案 | **针对性建议** |
| 扫描范围 | 无 | 全项目文件 |

---

## 🚀 快速开始

### 方式一：Vite 插件自动扫描（推荐）

在 `vite.config.ts` 中配置后，**开发服务器启动时自动扫描**：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: 'development'  // 开发环境自动扫描
})

export default defineConfig({
  plugins: [
    vue(),
    optimizer.vitePlugin  // 自动扫描所有文件
  ]
})
```

**效果**：
```bash
$ npm run dev

🔍 发现 12 个可优化点 (3 高优先级, 5 中优先级)
   运行完整扫描查看详细报告和建议
   使用: optimizer.showOptimizationTips()
```

---

### 方式二：手动扫描指定文件

```typescript
import { createCodeOptimizer } from 'front-universal-optimizer'
import fs from 'fs'

const optimizer = createCodeOptimizer({
  env: 'development'
})

// 读取项目文件
const files = [
  {
    path: 'src/router/index.ts',
    code: fs.readFileSync('src/router/index.ts', 'utf-8')
  },
  {
    path: 'src/views/Home.vue',
    code: fs.readFileSync('src/views/Home.vue', 'utf-8')
  }
]

// 扫描并生成报告
optimizer.showOptimizationTips(files)
```

**输出示例**：
```
╔══════════════════════════════════════════════════════════╗
║          front-universal-optimizer 扫描报告              ║
╚══════════════════════════════════════════════════════════╝

📊 扫描概览:
   总文件数: 2
   已扫描: 2
   发现问题: 5

📈 问题分类:
   ⚡ 性能优化: 3 个
   🔒 安全问题: 0 个
   🔍 SEO 优化: 0 个
   📦 打包优化: 1 个
   💡 最佳实践: 1 个

🔴 高优先级问题 (建议立即修复):

   1. 🔴 [⚡ 性能] 检测到静态路由导入: @/views/Home
      📁 文件: src/router/index.ts
      📍 位置: 第 5 行
      💡 建议: 建议改为懒加载: const component = () => import('@/views/Home')
      代码片段:
            3 | import { createRouter } from 'vue-router'
         >>> 5 | import Home from '@/views/Home'
            6 | import About from '@/views/About'

🟡 中优先级问题 (建议尽快修复):

   1. 🟡 [⚡ 性能] 图片未使用懒加载
      📁 文件: src/views/Home.vue
      📍 位置: 第 23 行
      💡 建议: 添加 loading="lazy" 属性: <img src="..." loading="lazy" />
      代码片段:
         >>> 23 | <img src="/images/banner.jpg" alt="Banner" />

💡 优化建议总结:
   1. 优先修复高优先级问题，这些对性能影响最大
   2. 使用中优先级问题提升用户体验
   3. 低优先级问题可以在后续迭代中逐步优化
   4. 所有建议仅供参考，请根据项目实际情况决定
```

---

### 方式三：快速扫描（适合 CI/CD）

```typescript
const files = [
  { path: 'src/App.tsx', code: fs.readFileSync('src/App.tsx', 'utf-8') }
]

// 快速扫描，返回结果对象
const result = optimizer.quickScan(files)

console.log(`发现 ${result.issues.length} 个问题`)
```

---

## 📋 扫描规则详解

### 1. ⚡ 性能优化检测

#### 1.1 路由懒加载（白屏优化）

**检测目标**：静态导入的路由组件

**示例代码**：
```typescript
// ❌ 问题代码
import Home from '@/views/Home'
import About from '@/views/About'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]
```

**扫描报告**：
```
🔴 [⚡ 性能] 检测到静态路由导入: @/views/Home
   📁 文件: src/router/index.ts
   📍 位置: 第 1 行
   💡 建议: 建议改为懒加载: const component = () => import('@/views/Home')
```

**优化方案**：
```typescript
// ✅ 优化后
const routes = [
  { path: '/', component: () => import('@/views/Home') },
  { path: '/about', component: () => import('@/views/About') }
]
```

---

#### 1.2 图片懒加载

**检测目标**：未使用 `loading="lazy"` 的图片

**示例代码**：
```vue
<!-- ❌ 问题代码 -->
<img src="/images/banner.jpg" alt="Banner" />
<img src="/images/logo.png" alt="Logo" />
```

**扫描报告**：
```
🟡 [⚡ 性能] 图片未使用懒加载
   📁 文件: src/views/Home.vue
   📍 位置: 第 10 行
   💡 建议: 添加 loading="lazy" 属性
```

**优化方案**：
```vue
<!-- ✅ 优化后 -->
<img src="/images/banner.jpg" alt="Banner" loading="lazy" />
<img src="/images/logo.png" alt="Logo" loading="lazy" />
```

---

#### 1.3 图片 WebP 格式

**检测目标**：可以使用 WebP 格式的 JPG/PNG 图片

**扫描报告**：
```
🟢 [⚡ 性能] 图片可能可以转换为 WebP 格式: /images/banner.jpg
   💡 建议: 考虑使用 WebP 格式以减小文件体积
```

---

#### 1.4 防抖/节流使用点

**检测目标**：高频事件处理器未使用防抖/节流

**示例代码**：
```typescript
// ❌ 问题代码
window.addEventListener('scroll', () => {
  console.log('scroll position:', window.scrollY)
})

function search(keyword: string) {
  fetch(`/api/search?q=${keyword}`)
}
```

**扫描报告**：
```
🟡 [⚡ 性能] 事件监听器 (scroll) 可能需要防抖或节流优化
   📁 文件: src/components/ScrollComponent.ts
   📍 位置: 第 15 行
   💡 建议: 考虑使用 useDebounce 或 useThrottle 包装该事件处理器
```

**优化方案**：
```typescript
// ✅ 优化后
import { useThrottle, useDebounce } from 'front-universal-optimizer'

const throttledScroll = useThrottle(() => {
  console.log('scroll position:', window.scrollY)
}, 200)

window.addEventListener('scroll', throttledScroll)

const debouncedSearch = useDebounce((keyword: string) => {
  fetch(`/api/search?q=${keyword}`)
}, 300)
```

---

### 2. 📦 打包优化检测

#### 2.1 大型库完整导入

**检测目标**：完整导入 lodash、moment、antd 等大型库

**示例代码**：
```typescript
// ❌ 问题代码
import lodash from 'lodash'
import moment from 'moment'
import Antd from 'antd'
```

**扫描报告**：
```
🔴 [📦 打包] 完整导入大型库: lodash，可能导致打包体积过大
   📁 文件: src/utils/helpers.ts
   📍 位置: 第 1 行
   💡 建议: 建议按需导入: import { specificFunction } from 'lodash'
```

**优化方案**：
```typescript
// ✅ 优化后
import { debounce, throttle } from 'lodash'  // 按需导入
import moment from 'moment'  // 或使用 dayjs 替代
import { Button, Input } from 'antd'  // 按需导入组件
```

---

### 3. 💡 最佳实践检测

#### 3.1 内存泄漏风险

**检测目标**：未清理的定时器、事件监听器

**示例代码**：
```typescript
// ❌ 问题代码
setTimeout(() => {
  console.log('timeout')
}, 1000)

setInterval(() => {
  console.log('interval')
}, 1000)
```

**扫描报告**：
```
🟡 [💡 实践] 检测到 setTimeout，请确保在适当时机清理
   📁 文件: src/utils/timer.ts
   📍 位置: 第 5 行
   💡 建议: 使用 useAutoClear 工具自动管理定时器清理
```

**优化方案**：
```typescript
// ✅ 优化后
import { useAutoClear } from 'front-universal-optimizer'

const cleaner = useAutoClear()

const timer = setTimeout(() => {
  console.log('timeout')
}, 1000)
cleaner.addTimer(timer)

// 组件卸载时自动清理
// cleaner.clearAll()
```

---

## 🎨 报告解读

### 问题严重程度

| 图标 | 级别 | 说明 | 建议 |
|------|------|------|------|
| 🔴 | 高优先级 | 对性能影响大 | **立即修复** |
| 🟡 | 中优先级 | 影响用户体验 | **尽快修复** |
| 🟢 | 低优先级 | 可以后续优化 | **逐步优化** |

### 问题类型

| 图标 | 类型 | 说明 |
|------|------|------|
| ⚡ | 性能优化 | 加载速度、渲染性能 |
| 📦 | 打包优化 | 代码体积、分包策略 |
| 🔒 | 安全问题 | XSS、敏感信息 |
| 🔍 | SEO 优化 | 搜索引擎优化 |
| 💡 | 最佳实践 | 代码质量、内存管理 |

---

## 🔧 高级用法

### 1. 自定义扫描规则

```typescript
import { CodeScanner } from 'front-universal-optimizer'

const scanner = new CodeScanner()

// 扫描单个文件
const issues = scanner.scanFile('src/App.tsx', code)

// 获取扫描结果
const result = scanner.getResult()
console.log(result.issues)
```

### 2. 集成到 CI/CD

```typescript
// scripts/scan.ts
import { createCodeOptimizer } from 'front-universal-optimizer'
import fs from 'fs'
import glob from 'glob'

const optimizer = createCodeOptimizer({ env: 'development' })

// 扫描所有 TS/TSX 文件
const files = glob.sync('src/**/*.{ts,tsx}').map(path => ({
  path,
  code: fs.readFileSync(path, 'utf-8')
}))

const result = optimizer.scanCode(files)

// 检查是否有高优先级问题
const highIssues = result.issues.filter(i => i.severity === 'high')
if (highIssues.length > 0) {
  console.error(`发现 ${highIssues.length} 个高优先级问题`)
  process.exit(1)
}
```

### 3. 生成 JSON 报告

```typescript
const result = optimizer.scanCode(files)

// 保存为 JSON 文件
fs.writeFileSync('scan-report.json', JSON.stringify(result, null, 2))
```

---

## 📊 性能影响

- **扫描速度**：平均 100 文件/秒
- **内存占用**：< 50MB
- **构建影响**：开发环境几乎无影响，生产环境不扫描

---

## 🤝 最佳实践

1. **开发时自动扫描**：使用 Vite 插件，启动时自动扫描
2. **提交前检查**：在 git pre-commit hook 中运行扫描
3. **CI/CD 集成**：在构建流程中检查高优先级问题
4. **定期扫描**：每周运行一次完整扫描，跟踪优化进度

---

## ❓ 常见问题

### Q: 扫描会修改我的代码吗？
**A**: 不会！扫描**只读不写**，只提供建议，不会自动修改代码。

### Q: 扫描会影响开发服务器性能吗？
**A**: 几乎无影响。扫描在文件转换时异步进行，不会阻塞构建。

### Q: 可以自定义扫描规则吗？
**A**: 当前版本使用内置规则，未来版本将支持自定义规则。

### Q: 如何忽略某些文件？
**A**: 在调用 `scanCode` 时过滤掉不想扫描的文件。

---

## 🎯 总结

智能扫描功能帮助您：
- ✅ **自动发现**性能优化点
- ✅ **精准定位**问题文件行号
- ✅ **提供建议**基于实际代码
- ✅ **自主决定**是否采纳建议
- ✅ **持续改进**项目质量

**开始使用**：
```typescript
const optimizer = createCodeOptimizer({ env: 'development' })
optimizer.showOptimizationTips(files)
```
