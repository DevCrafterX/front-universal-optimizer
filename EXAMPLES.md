# front-universal-optimizer 使用示例

本文件提供各个框架的完整使用示例，复制即可使用。

---

## 📋 目录

- [Vue 3 + Vite](#vue-3--vite)
- [React + Vite](#react--vite)
- [Next.js 13+](#nextjs-13)
- [Nuxt 3](#nuxt-3)
- [Angular](#angular)
- [Uniapp](#uniapp)
- [Svelte](#svelte)
- [原生 JavaScript](#原生-javascript)

---

## Vue 3 + Vite

### 1. 安装

```bash
npm install front-universal-optimizer
```

### 2. Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  chunkSplit: {
    enable: true,
    strategy: 'fine-grained'
  },
  clearConsole: process.env.NODE_ENV === 'production'
})

export default defineConfig({
  plugins: [vue(), optimizer.vitePlugin]
})
```

### 3. 组件中使用

```vue
<script setup lang="ts">
import { useDebounce, useThrottle, SecurityGuard } from 'front-universal-optimizer'
import { ref } from 'vue'

const keyword = ref('')

// 防抖搜索
const search = useDebounce((kw: string) => {
  console.log('搜索:', kw)
}, 300)

// XSS 防护
const safeHtml = SecurityGuard.xssEscape('<script>alert("xss")</script>')
</script>

<template>
  <input v-model="keyword" @input="search(keyword)" />
  <div v-html="safeHtml"></div>
</template>
```

---

## React + Vite

### 1. 安装

```bash
npm install front-universal-optimizer
```

### 2. Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development'
})

export default defineConfig({
  plugins: [react(), optimizer.vitePlugin]
})
```

### 3. 组件中使用

```tsx
import { useState, useEffect } from 'react'
import { useDebounce, useThrottle, SecurityGuard } from 'front-universal-optimizer'

function SearchComponent() {
  const [keyword, setKeyword] = useState('')
  
  const debouncedSearch = useDebounce((kw: string) => {
    console.log('搜索:', kw)
  }, 300)

  return (
    <input
      value={keyword}
      onChange={(e) => {
        setKeyword(e.target.value)
        debouncedSearch(e.target.value)
      }}
    />
  )
}

export default SearchComponent
```

---

## Next.js 13+

### 1. 安装

```bash
npm install front-universal-optimizer
```

### 2. 配置

```javascript
// next.config.js
const { createCodeOptimizer } = require('front-universal-optimizer')

const optimizer = createCodeOptimizer({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (!dev) {
      optimizer.enableProductionMode()
    }
    return config
  }
}

module.exports = nextConfig
```

### 3. 客户端组件中使用

```tsx
// app/page.tsx
'use client'

import { useDebounce } from 'front-universal-optimizer'

export default function Home() {
  const search = useDebounce((keyword: string) => {
    console.log('搜索:', keyword)
  }, 300)

  return (
    <input onChange={(e) => search(e.target.value)} />
  )
}
```

---

## Nuxt 3

### 1. 安装

```bash
npm install front-universal-optimizer
```

### 2. 配置

```typescript
// nuxt.config.ts
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development'
})

export default defineNuxtConfig({
  vite: {
    plugins: [optimizer.vitePlugin]
  }
})
```

### 3. 组件中使用

```vue
<script setup>
import { useDebounce, SecurityGuard } from 'front-universal-optimizer'

const search = useDebounce((keyword) => {
  console.log('搜索:', keyword)
}, 300)

// SSR 兼容的安全存储
SecurityGuard.setSafeStorage('token', 'your-token')
</script>

<template>
  <input @input="search($event.target.value)" />
</template>
```

---

## Angular

### 1. 安装

```bash
npm install front-universal-optimizer
```

### 2. 组件中使用

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core'
import { useDebounce, SecurityGuard } from 'front-universal-optimizer'

@Component({
  selector: 'app-search',
  template: `<input [value]="keyword" (input)="onSearch($event)" />`
})
export class SearchComponent implements OnInit, OnDestroy {
  keyword = ''
  private debouncedSearch: any

  ngOnInit() {
    this.debouncedSearch = useDebounce((kw: string) => {
      console.log('搜索:', kw)
    }, 300)
  }

  onSearch(event: any) {
    this.keyword = event.target.value
    this.debouncedSearch(this.keyword)
  }

  ngOnDestroy() {
    if (this.debouncedSearch?.cancel) {
      this.debouncedSearch.cancel()
    }
  }
}
```

---

## Uniapp

### 1. 安装

```bash
npm install front-universal-optimizer
```

### 2. Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development'
})

export default defineConfig({
  plugins: [uni(), optimizer.vitePlugin]
})
```

### 3. 页面中使用

```vue
<script setup>
import { useDebounce, SecurityGuard } from 'front-universal-optimizer'

const search = useDebounce((keyword) => {
  uni.request({
    url: 'https://api.example.com/search',
    data: { keyword }
  })
}, 300)

SecurityGuard.setSafeStorage('token', 'your-token')
</script>

<template>
  <input @input="search($event.detail.value)" placeholder="搜索" />
</template>
```

---

## Svelte

### 1. 安装

```bash
npm install front-universal-optimizer
```

### 2. Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development'
})

export default defineConfig({
  plugins: [svelte(), optimizer.vitePlugin]
})
```

### 3. 组件中使用

```svelte
<script lang="ts">
  import { useDebounce, SecurityGuard } from 'front-universal-optimizer'

  let keyword = ''

  const search = useDebounce((value: string) => {
    console.log('搜索:', value)
  }, 300)

  $: search(keyword)
</script>

<input bind:value={keyword} placeholder="搜索" />
```

---

## 原生 JavaScript

### 1. CDN 引入

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { 
      createCodeOptimizer, 
      useDebounce, 
      SecurityGuard 
    } from 'https://unpkg.com/front-universal-optimizer/dist/index.esm.js'

    const optimizer = createCodeOptimizer({ env: 'development' })
    optimizer.showOptimizationTips()

    const search = useDebounce((keyword) => {
      console.log('搜索:', keyword)
    }, 300)

    document.getElementById('search').addEventListener('input', (e) => {
      search(e.target.value)
    })
  </script>
</head>
<body>
  <input id="search" placeholder="搜索" />
</body>
</html>
```

---

## 🔧 常用 API 速查

### Hooks

```typescript
import { useDebounce, useThrottle, useAutoClear, useVirtualList } from 'front-universal-optimizer'

// 防抖
const fn = useDebounce(() => {}, 300)
fn.cancel() // 取消

// 节流
const fn = useThrottle(() => {}, 200)
fn.cancel() // 取消

// 自动清理
const cleaner = useAutoClear()
cleaner.addTimer(timer)
cleaner.clearAll()

// 虚拟列表
const { visibleList, totalHeight, scrollTo } = useVirtualList(data, {
  itemHeight: 50,
  visibleCount: 10
})
```

### 安全防护

```typescript
import { SecurityGuard } from 'front-universal-optimizer'

// XSS 转义
SecurityGuard.xssEscape('<script>alert("xss")</script>')
SecurityGuard.xssEscape(input, true) // 严格模式

// 安全存储
SecurityGuard.setSafeStorage('key', value)
SecurityGuard.getSafeStorage('key')

// 请求检测
SecurityGuard.secureRequest({ url, params })

// 危险 API 检测
SecurityGuard.checkDangerApi(true) // 严格模式
```

### 优化器

```typescript
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: 'development', // 或 'production'
  chunkSplit: { enable: true, strategy: 'fine-grained' },
  clearConsole: true,
  enableCSP: true
})

// 显示优化建议
optimizer.showOptimizationTips()

// 生产模式
optimizer.enableProductionMode()

// 使用 Vite 插件
export default {
  plugins: [optimizer.vitePlugin]
}
```

---

## 📚 更多文档

- [完整 README](./README.md)
- [Vite 集成指南](./VITE_INTEGRATION_GUIDE.md)
- [迁移指南](./MIGRATION_GUIDE.md)
