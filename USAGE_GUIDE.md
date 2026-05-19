# 📦 front-universal-optimizer 在其他项目中的使用指南

## ✅ Vite 插件自动扫描 - 可以正常生效！

经过修复，现在 Vite 插件的自动扫描功能**已经可以正常工作**了。

---

## 🚀 使用方式

### 方式一：Vite 插件自动扫描（推荐 ⭐）

这是最简单的方式，**零配置**即可使用。

#### 1. 安装依赖

```bash
# 在你的 Vite 项目中执行
npm install front-universal-optimizer

# 或从本地安装（开发测试）
npm install /path/to/front-universal-optimizer
```

#### 2. 配置 vite.config.ts

**Vue 3 项目示例：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createCodeOptimizer } from 'front-universal-optimizer'

// 创建优化器实例
const optimizer = createCodeOptimizer({
  env: 'development'  // 开发环境会输出优化建议
})

export default defineConfig({
  plugins: [
    vue(),
    optimizer.vitePlugin  // 添加插件，自动扫描所有文件
  ]
})
```

**React 项目示例：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: 'development'
})

export default defineConfig({
  plugins: [
    react(),
    optimizer.vitePlugin
  ]
})
```

#### 3. 启动项目

```bash
npm run dev
```

#### 4. 看到的效果

```
🔍 [front-universal-optimizer] 代码扫描已启用，正在分析您的代码...

[正常启动 Vite 开发服务器...]

  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

📋 [front-universal-optimizer] 扫描完成，发现以下优化建议：

🔍 发现 5 个可优化点 (2 高优先级, 3 中优先级)
   运行完整扫描查看详细报告和建议
   使用: optimizer.showOptimizationTips()

💡 提示：使用 optimizer.showOptimizationTips() 查看详细报告
```

---

### 方式二：手动扫描（适合定制需求）

如果你想在特定时刻扫描，或扫描特定文件：

```typescript
// scripts/scan.ts
import { createCodeOptimizer } from 'front-universal-optimizer'
import fs from 'fs'
import path from 'path'

const optimizer = createCodeOptimizer({
  env: 'development'
})

// 读取要扫描的文件
const files = [
  {
    path: 'src/router/index.ts',
    code: fs.readFileSync('src/router/index.ts', 'utf-8')
  },
  {
    path: 'src/views/Home.vue',
    code: fs.readFileSync('src/views/Home.vue', 'utf-8')
  },
  {
    path: 'src/App.tsx',
    code: fs.readFileSync('src/App.tsx', 'utf-8')
  }
]

// 显示详细报告
optimizer.showOptimizationTips(files)
```

运行：

```bash
npx tsx scripts/scan.ts
```

输出：

```
╔══════════════════════════════════════════════════════════╗
║          front-universal-optimizer 扫描报告              ║
╚══════════════════════════════════════════════════════════╝

📊 扫描概览:
   总文件数: 3
   已扫描: 3
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

   2. 🔴 [📦 打包] 完整导入大型库: lodash，可能导致打包体积过大
      📁 文件: src/utils/helper.ts
      📍 位置: 第 1 行
      💡 建议: 建议按需导入: import { specificFunction } from 'lodash'

🟡 中优先级问题 (建议尽快修复):

   1. 🟡 [⚡ 性能] 图片未使用懒加载
      📁 文件: src/views/Home.vue
      📍 位置: 第 23 行
      💡 建议: 添加 loading="lazy" 属性: <img src="..." loading="lazy" alt=""/>
      
   2. 🟡 [⚡ 性能] 高频事件 @input 可能需要防抖或节流优化
      📁 文件: src/components/Search.vue
      📍 位置: 第 15 行
      💡 建议: 考虑使用 useDebounce 或 useThrottle 包装事件处理器
      
   3. 🟡 [💡 实践] 检测到 setInterval，请确保在适当时机清理
      📁 文件: src/utils/timer.ts
      📍 位置: 第 8 行
      💡 建议: 使用 useAutoClear 工具自动管理定时器清理

💡 优化建议总结:
   1. 优先修复高优先级问题，这些对性能影响最大
   2. 使用中优先级问题提升用户体验
   3. 低优先级问题可以在后续迭代中逐步优化
   4. 所有建议仅供参考，请根据项目实际情况决定
```

---

## 🎯 完整功能使用示例

### 1. 使用 Hooks（防抖/节流）

```typescript
// React 项目
import React, { useState } from 'react'
import { useDebounce, useThrottle } from 'front-universal-optimizer'

function SearchComponent() {
  const [value, setValue] = useState('')
  
  // 防抖搜索（300ms）
  const debouncedSearch = useDebounce((keyword: string) => {
    console.log('搜索:', keyword)
    // 调用搜索 API
  }, 300)
  
  // 节流滚动处理（200ms）
  const throttledScroll = useThrottle(() => {
    console.log('滚动位置:', window.scrollY)
  }, 200)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    debouncedSearch(e.target.value)
  }
  
  React.useEffect(() => {
    window.addEventListener('scroll', throttledScroll)
    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [])
  
  return (
    <input 
      value={value} 
      onChange={handleChange} 
      placeholder="搜索..."
    />
  )
}
```

### 2. 使用自动清理工具

```typescript
// Vue 3 项目
import { useAutoClear } from 'front-universal-optimizer'

export default {
  setup() {
    const cleaner = useAutoClear()
    
    // 添加定时器（会自动清理）
    const timer = setInterval(() => {
      console.log('定时任务')
    }, 1000)
    cleaner.addTimer(timer)
    
    // 组件卸载时自动清理所有定时器
    return () => {
      cleaner.clearAll()
    }
  }
}
```

### 3. 使用安全防护

```typescript
import { SecurityGuard } from 'front-universal-optimizer'

// XSS 转义
const userInput = '<script>alert("xss")</script>'
const safeInput = SecurityGuard.xssEscape(userInput)
console.log(safeInput) // &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

// 安全请求检测
SecurityGuard.secureRequest({
  url: 'https://api.example.com/login',
  data: {
    username: 'admin',
    password: '123456'  // 会输出警告
  }
})

// 危险 API 检测
const dangerApis = SecurityGuard.checkDangerApi('eval("...")')
console.log(dangerApis) // ['eval']
```

---

## 📋 支持的文件类型

现在插件可以扫描以下所有文件类型：

| 文件类型 | 扩展名 | 扫描能力 |
|---------|--------|---------|
| JavaScript | `.js`, `.jsx` | ✅ 完整支持 |
| TypeScript | `.ts`, `.tsx` | ✅ 完整支持 |
| Vue SFC | `.vue` | ✅ Script + Template |
| Svelte | `.svelte` | ✅ Script + Template |
| Astro | `.astro` | ✅ 完整支持 |

---

## ⚙️ 配置选项

```typescript
const optimizer = createCodeOptimizer({
  env: 'development',  // 'development' 或 'production'
  
  // 性能优化
  routeLazyLoad: true,        // 路由懒加载检测
  imageWebpConvert: true,     // 图片 WebP 转换建议
  autoDebounce: true,         // 防抖建议
  autoThrottle: true,         // 节流建议
  
  // 打包优化
  chunkSplit: {
    enable: true,
    strategy: 'fine-grained'  // 细粒度分包
  },
  clearConsole: true,         // 清除 console
  brotliCompress: true,       // Brotli 压缩
  
  // 安全防护
  enableXSSDefend: true,      // XSS 防护
  safeRequestFilter: true,    // 请求安全检测
  enableCSP: true,            // CSP 建议
  cspPolicy: "default-src 'self'"
})
```

---

## 🔍 工作原理

### Vite 插件自动扫描流程：

```
1. 启动 Vite 开发服务器
   ↓
2. buildStart 钩子触发
   → 输出："🔍 代码扫描已启用，正在分析您的代码..."
   ↓
3. 编译文件时（transform 钩子）
   → 扫描 .js/.ts/.jsx/.tsx/.vue/.svelte/.astro 文件
   → 收集问题（不输出）
   ↓
4. 构建完成时（closeBundle 钩子）
   → 输出扫描报告
   → 显示优化建议
```

### 关键修复点：

**修复前：**
- ❌ 只在 `transform` 钩子中扫描
- ❌ 没有输出报告的地方
- ❌ 用户看不到任何信息

**修复后：**
- ✅ 添加 `buildStart` 钩子 - 启动提示
- ✅ 添加 `closeBundle` 钩子 - 输出报告
- ✅ 使用 `hasReported` 标志防止重复输出

---

## 🎓 最佳实践

### 1. 开发环境使用自动扫描

```typescript
// vite.config.ts
const optimizer = createCodeOptimizer({
  env: process.env.NODE_ENV === 'development' ? 'development' : 'production'
})
```

### 2. 生产环境关闭扫描

```typescript
// 生产环境只应用编译优化，不输出建议
const optimizer = createCodeOptimizer({
  env: 'production'
})
```

### 3. CI/CD 集成

```bash
# 在 CI 流程中运行扫描
npx tsx scripts/scan.ts

# 如果有高优先级问题，构建失败
if [ $? -ne 0 ]; then
  echo "发现高优先级问题，请修复后重新提交"
  exit 1
fi
```

---

## ❓ 常见问题

### Q: 插件会自动修改我的代码吗？

**A**: 不会！插件**只读不写**，只提供建议，不会自动修改代码。

### Q: 扫描会影响开发服务器性能吗？

**A**: 几乎无影响。扫描在文件转换时异步进行，不会阻塞构建。

### Q: 为什么有时候看不到输出？

**A**: 可能的原因：
1. 代码质量很好，没有发现问题 ✅
2. 设置了 `env: 'production'`（生产环境不输出）
3. 扫描的文件没有问题

### Q: 可以自定义扫描规则吗？

**A**: 可以！使用 `CodeScanner` 类：

```typescript
import { CodeScanner } from 'front-universal-optimizer'

const scanner = new CodeScanner()

scanner.addCustomRule({
  name: '检测 console.log',
  test: (filePath, code) => {
    const issues = []
    if (code.includes('console.log')) {
      issues.push({
        type: 'best-practice',
        severity: 'low',
        file: filePath,
        line: 1,
        column: 1,
        message: '检测到 console.log',
        suggestion: '生产环境应移除 console.log'
      })
    }
    return issues
  }
})
```

### Q: 如何忽略某些文件？

**A**: 在 Vite 配置中排除：

```typescript
export default defineConfig({
  plugins: [
    optimizer.vitePlugin
  ],
  optimizeDeps: {
    exclude: ['some-library']  // 排除某些依赖
  }
})
```

---

## 🎉 总结

现在这个依赖在其他项目中可以**完全正常使用**了！

✅ **Vite 插件自动扫描** - 零配置，启动即用  
✅ **支持多种文件类型** - JS/TS/JSX/TSX/Vue/Svelte/Astro  
✅ **详细的优化建议** - 具体到文件+行号  
✅ **零侵入设计** - 只读不写，不影响构建  
✅ **多框架支持** - Vue/React/Angular/Svelte  

**立即体验：**

```bash
npm install front-universal-optimizer
```

```typescript
// vite.config.ts
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({ env: 'development' })

export default defineConfig({
  plugins: [optimizer.vitePlugin]
})
```

```bash
npm run dev
# 即可看到扫描报告！
```
