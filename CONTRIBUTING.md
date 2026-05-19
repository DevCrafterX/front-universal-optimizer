# 贡献指南

感谢你对 front-universal-optimizer 项目的关注！欢迎提交 Issue 和 Pull Request。

## 🤝 如何贡献

### 1. 报告问题

如果你发现了 bug 或有功能建议，请 [创建 Issue](https://github.com/your-username/front-universal-optimizer/issues)。

**提交 Bug 报告时请包含：**
- 项目版本
- 复现步骤
- 预期行为
- 实际行为
- 运行环境（Node.js 版本、框架版本等）

### 2. 提交代码

#### 开发流程

```bash
# 1. Fork 项目
# 2. 创建特性分支
git checkout -b feature/amazing-feature

# 3. 安装依赖
npm install

# 4. 进行修改
# ... 你的代码 ...

# 5. 运行测试
npm test

# 6. 构建项目
npm run build

# 7. 提交代码
git commit -m "feat: add amazing feature"

# 8. 推送到分支
git push origin feature/amazing-feature

# 9. 创建 Pull Request
```

#### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构代码
- `test:` 添加或修改测试
- `chore:` 构建过程或辅助工具变动

**示例：**
```
feat: add custom scan rule support
fix: resolve babel dependency conflict
docs: update README with Vue 3 examples
```

### 3. 改进文档

文档改进同样重要！你可以：
- 修正拼写/语法错误
- 添加使用示例
- 改进文档结构
- 翻译文档

## 📋 开发指南

### 项目结构

```
front-universal-optimizer/
├── src/                    # 源代码
│   ├── config/            # 配置文件
│   ├── core/              # 核心功能
│   │   ├── codeScanner.ts    # 代码扫描引擎
│   │   ├── frameAdapter.ts   # 框架适配
│   │   └── securityGuard.ts  # 安全防护
│   ├── hooks/             # React/Vue Hooks
│   ├── plugins/           # Vite 插件
│   ├── utils/             # 工具函数
│   └── index.ts           # 主入口
├── tests/                  # 测试文件
├── dist/                   # 构建产物（自动生成）
├── README.md              # 项目文档
├── COMPATIBILITY.md       # 兼容性指南
├── EXAMPLES.md            # 使用示例
└── SCAN_GUIDE.md          # 扫描功能文档
```

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 运行测试
npm test

# 运行测试（监听模式）
npm run test:watch

# 构建项目
npm run build

# 代码检查
npm run lint

# 自动修复代码风格
npm run lint:fix
```

### 测试要求

- 所有新功能必须包含测试
- 确保所有测试通过后再提交 PR
- 测试覆盖率应保持在 80% 以上

```bash
# 运行测试
npm test

# 查看测试覆盖率
npm run test:ui
```

## 🎯 可以贡献的方向

### 1. 新增扫描规则

在 `src/core/codeScanner.ts` 中添加新的检测规则：

```typescript
// 示例：添加新的检测规则
private checkYourRule(filePath: string, code: string, ast: any, traverse: any) {
  // 检测逻辑
}
```

### 2. 框架适配

支持更多框架或框架的新版本：

```typescript
// 在 src/core/frameAdapter.ts 中添加
export enum FrameType {
  // 现有框架...
  NEW_FRAMEWORK = 'new-framework'
}
```

### 3. 性能优化

- 提升扫描速度
- 减少内存占用
- 优化打包体积

### 4. 文档改进

- 添加更多使用示例
- 完善 API 文档
- 添加教程

### 5. Bug 修复

查看 [Issues](https://github.com/your-username/front-universal-optimizer/issues) 中标记为 `bug` 的问题。

## 📝 代码规范

### TypeScript 规范

- 使用严格的类型检查
- 避免使用 `any`，使用具体类型
- 为所有公开 API 添加类型定义

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 语句末尾不加分号（除非必要）

运行 `npm run lint:fix` 自动格式化代码。

### 注释规范

- 为所有公开方法添加 JSDoc 注释
- 复杂逻辑添加行内注释
- 使用中文注释

```typescript
/**
 * 扫描单个文件
 * @param filePath 文件路径
 * @param code 文件内容
 * @returns 发现的问题列表
 */
scanFile(filePath: string, code: string): ScanIssue[]
```

## 🚀 发布流程

只有项目维护者可以发布新版本：

```bash
# 1. 更新版本号
npm version patch  # 或 minor, major

# 2. 构建项目
npm run build

# 3. 运行测试
npm test

# 4. 发布到 npm
npm publish

# 5. 推送到 GitHub
git push && git push --tags
```

## 💬 联系我们

- 提交 [Issue](https://github.com/your-username/front-universal-optimizer/issues)
- 发起 [Pull Request](https://github.com/your-username/front-universal-optimizer/pulls)

## 📄 许可证

提交代码即表示你同意将代码以 [MIT License](./LICENSE) 发布。

---

感谢你的贡献！🎉
