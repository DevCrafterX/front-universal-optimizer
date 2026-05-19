# 迁移指南 v1.0 → v1.1

本文档帮助你从 v1.0.x 迁移到 v1.1.x 版本。

## 🎯 主要变更

### 1. Vite 版本支持扩展

**变更**：支持 Vite 4.x ~ 8.x

```diff
// package.json
{
  "peerDependencies": {
-   "vite": "^4.0.0 || ^5.0.0"
+   "vite": "^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0"
  }
}
```

**影响**：✅ 向后兼容，无需修改代码

---

### 2. 移除 Webpack 相关依赖

**变更**：移除了 `terser-webpack-plugin` 和 webpack peerDependency

```diff
// package.json
{
- "peerDependencies": {
-   "webpack": "^5.0.0"
- },
  "optionalDependencies": {
    "chalk": "^4.1.2",
-   "terser-webpack-plugin": "^5.3.0"
  }
}
```

**影响**：
- ⚠️ 如果你仍在使用 Webpack 插件，需要手动安装 `terser-webpack-plugin`
- ✅ Vite 项目不受影响

**迁移步骤**（仅 Webpack 用户）：

```bash
npm install terser-webpack-plugin --save-dev
```

---

### 3. chunkSplit 配置升级

**变更**：`chunkSplit` 从布尔值升级为对象配置

```diff
// v1.0
const optimizer = createCodeOptimizer({
- chunkSplit: true
})

// v1.1 - 方式一：仍然支持布尔值（向后兼容）
const optimizer = createCodeOptimizer({
  chunkSplit: true  // ✅ 仍然有效
})

// v1.1 - 方式二：使用细粒度配置（推荐）
const optimizer = createCodeOptimizer({
  chunkSplit: {
    enable: true,
    strategy: 'fine-grained',
    maxInitialSize: 244 * 1024,
    maxAsyncSize: 244 * 1024
  }
})

// v1.1 - 方式三：自定义分包规则
const optimizer = createCodeOptimizer({
  chunkSplit: {
    enable: true,
    strategy: 'custom',
    customRules: {
      'vendor-ui': (id) => id.includes('antd'),
      'vendor-charts': (id) => id.includes('echarts')
    }
  }
})
```

**影响**：✅ 完全向后兼容，旧代码无需修改

**建议**：新项目使用细粒度配置以获得更好的性能

---

### 4. Console 清理策略

**变更**：新增 `consoleRemovalStrategy` 配置项

```diff
// v1.0
const optimizer = createCodeOptimizer({
  clearConsole: true  // 使用正则替换
})

// v1.1 - 方式一：继续使用正则（向后兼容）
const optimizer = createCodeOptimizer({
  clearConsole: true,
  consoleRemovalStrategy: 'regex'  // 显式指定
})

// v1.1 - 方式二：使用 Babel 插件（推荐）
const optimizer = createCodeOptimizer({
  clearConsole: true,
  consoleRemovalStrategy: 'babel'  // 默认值
})
```

**影响**：✅ 向后兼容，默认使用 Babel 策略

**迁移步骤**（如果使用 Babel 策略）：

1. 安装 Babel 插件：
```bash
npm install @babel/core @babel/plugin-transform-remove-console --save-dev
```

2. 创建 `babel.config.js`：
```javascript
module.exports = {
  plugins: [
    ['@babel/plugin-transform-remove-console', {
      exclude: ['error', 'warn']
    }]
  ]
}
```

---

### 5. CSP 策略可定制

**变更**：新增 `cspPolicy` 配置项

```diff
// v1.0
const optimizer = createCodeOptimizer({
  enableCSP: true  // 使用默认策略
})

// v1.1 - 自定义 CSP 策略
const optimizer = createCodeOptimizer({
  enableCSP: true,
  cspPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'"
})
```

**影响**：✅ 向后兼容，未指定时使用默认策略

---

### 6. package.json exports 字段

**变更**：新增 `exports` 字段以更好地支持现代模块解析

```diff
{
  "main": "dist/index.cjs",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
+ "exports": {
+   ".": {
+     "types": "./dist/index.d.ts",
+     "import": "./dist/index.esm.js",
+     "require": "./dist/index.cjs"
+   }
+ }
}
```

**影响**：✅ 改进兼容性，不影响现有使用

---

## 📋 迁移检查清单

### 对于 Vite 项目

- [ ] 确认 Vite 版本在 4.x ~ 8.x 范围内
- [ ] （可选）更新 `chunkSplit` 配置为细粒度模式
- [ ] （可选）配置 Babel 插件用于 console 清理
- [ ] （可选）自定义 CSP 策略

### 对于 Webpack 项目

- [ ] 手动安装 `terser-webpack-plugin`
- [ ] 测试 Webpack 插件是否正常工作
- [ ] 考虑迁移到 Vite 以获得更好支持

### 通用检查

- [ ] 运行测试确保功能正常
- [ ] 检查构建输出是否符合预期
- [ ] 验证 TypeScript 类型是否正确

---

## 🔄 快速迁移示例

### Vite + Vue 项目

```typescript
// vite.config.ts (v1.0)
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: 'production',
  chunkSplit: true,
  clearConsole: true,
  enableCSP: true
})

// ↓ 迁移到 v1.1

// vite.config.ts (v1.1)
import { createCodeOptimizer } from 'front-universal-optimizer'

const optimizer = createCodeOptimizer({
  env: 'production',
  
  // 细粒度分包（新特性）
  chunkSplit: {
    enable: true,
    strategy: 'fine-grained'
  },
  
  // Babel console 清理（新特性）
  clearConsole: true,
  consoleRemovalStrategy: 'babel',
  
  // 自定义 CSP（新特性）
  enableCSP: true,
  cspPolicy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
})
```

### React 项目

```typescript
// vite.config.ts (v1.0)
const optimizer = createCodeOptimizer({
  env: 'production',
  enableAllOpt: true
})

// ↓ 迁移到 v1.1（可以保持不变，完全兼容）

// vite.config.ts (v1.1)
const optimizer = createCodeOptimizer({
  env: 'production',
  enableAllOpt: true  // ✅ 仍然有效
})

// 或使用新特性
const optimizer = createCodeOptimizer({
  env: 'production',
  chunkSplit: {
    enable: true,
    strategy: 'fine-grained',
    customRules: {
      'vendor-antd': (id) => id.includes('antd')
    }
  },
  clearConsole: true,
  consoleRemovalStrategy: 'babel'
})
```

---

## ❓ 常见问题

### Q1: 我的旧代码还能用吗？

**A**: ✅ 是的，v1.1 完全向后兼容 v1.0 的所有 API。

### Q2: 必须升级到 v1.1 吗？

**A**: 不强制，但建议升级以获得：
- Vite 6-8 支持
- 细粒度分包（提升性能）
- 更好的 console 清理
- 可定制的 CSP 策略

### Q3: 升级后需要重新测试吗？

**A**: 建议运行你的测试套件，但理论上不应该有破坏性变更。

### Q4: Webpack 用户怎么办？

**A**: 
1. 手动安装 `terser-webpack-plugin`
2. 或者考虑迁移到 Vite（推荐）

### Q5: 如何回退到 v1.0？

**A**: 
```bash
npm install front-universal-optimizer@1.0.3
```

---

## 📞 需要帮助？

如果迁移过程中遇到问题：

1. 查看 [VITE_INTEGRATION_GUIDE.md](./VITE_INTEGRATION_GUIDE.md)
2. 查看 [README.md](./README.md)
3. 提交 Issue：https://github.com/xxx/front-universal-optimizer/issues

---

## ✨ 总结

v1.1 是一个**完全向后兼容**的功能增强版本：

- ✅ 所有 v1.0 代码无需修改即可运行
- ✅ 新增细粒度分包、Babel console 清理等特性
- ✅ 支持 Vite 4-8 全版本
- ⚠️ Webpack 用户需手动安装依赖

建议所有用户升级到 v1.1 以获得更好的性能和更多功能！
