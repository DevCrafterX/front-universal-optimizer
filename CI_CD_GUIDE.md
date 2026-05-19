# GitHub CI/CD 配置指南

**更新日期**: 2026-05-19  
**状态**: ✅ 已配置并测试通过

---

## 📋 概述

本项目已配置完整的 GitHub Actions CI/CD 流程，实现：
- ✅ 代码提交自动检查语法（ESLint）
- ✅ 自动运行测试（70项测试）
- ✅ 自动构建打包（build）
- ✅ PR 保护（不通过不允许合并）
- ✅ 自动发布到 npm（可选）

---

## 🚀 快速开始

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "feat: add CI/CD configuration"
git push origin main
```

### 2. 查看 CI/CD 状态

访问你的 GitHub 仓库 → **Actions** 标签页，即可看到自动化流程执行情况。

### 3. PR 保护机制

当创建 Pull Request 时，CI/CD 会自动运行：
- 如果任何检查失败 ❌ → PR 无法合并
- 如果所有检查通过 ✅ → PR 可以合并

---

## 📊 CI/CD 流程说明

### 触发条件

```yaml
on:
  push:
    branches: [main, master]  # 推送到主分支时触发
  pull_request:
    branches: [main, master]  # 创建 PR 时触发
```

### 执行步骤

#### Job 1:  Code Quality Check（代码质量检查）
```bash
npm ci              # 安装依赖
npm run lint        # ESLint 检查
npx tsc --noEmit    # TypeScript 类型检查
```

**目标**: 确保代码符合规范，无语法错误

#### Job 2: 🧪 Run Tests（运行测试）
```bash
npm ci              # 安装依赖
npm test            # 运行 70 项测试
```

**目标**: 确保所有功能正常工作

#### Job 3: 🏗️ Build Package（构建打包）
```bash
npm ci              # 安装依赖
npm run build       # 构建生产版本
```

**目标**: 验证构建成功，生成 dist/ 目录

#### Job 4:  Publish to npm（发布到 npm）
```bash
npm ci              # 安装依赖
npm run build       # 构建
npm publish         # 发布到 npm
```

**触发条件**: 仅当 push 到 main/master 分支时执行  
**前置条件**: 需要配置 NPM_TOKEN secret

#### Job 5: ✅ PR Protection Check（PR 保护检查）
```bash
echo "All checks passed!"
```

**目标**: 汇总所有检查结果，阻止不合格的 PR 合并

---

## ️ 配置说明

### ESLint 配置

**文件**: `eslint.config.js`

**规则**:
- TypeScript 推荐规则
- 禁止使用 `var`，必须使用 `const/let`
- 必须使用单引号
- 禁止分号
- 允许 console.warn 和 console.error
- optimizeTips.ts 中允许 console.log（优化提示必需）

**运行命令**:
```bash
npm run lint        # 检查代码规范
npm run lint:fix    # 自动修复可修复的问题
```

### package.json 脚本

```json
{
  "scripts": {
    "build": "rollup -c",           // 构建生产版本
    "dev": "rollup -c -w",          // 开发模式
    "test": "vitest run",           // 运行测试
    "test:watch": "vitest",         // 监听模式测试
    "test:ui": "vitest --ui",       // UI 模式测试
    "lint": "eslint src/ tests/ --ext .ts,.tsx",  // ESLint 检查
    "lint:fix": "eslint src/ tests/ --ext .ts,.tsx --fix",  // 自动修复
    "prepublishOnly": "npm run build"  // 发布前自动构建
  }
}
```

---

## 🔐 安全配置

### 配置 NPM_TOKEN（用于自动发布）

1. 登录 [npmjs.com](https://www.npmjs.com/)
2. 进入 **Access Tokens** → **Generate New Token**
3. 选择 **Automation** 类型
4. 复制生成的 token

5. 在 GitHub 仓库中：
   - 进入 **Settings** → **Secrets and variables** → **Actions**
   - 点击 **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: 粘贴刚才复制的 token
   - 点击 **Add secret**

### .gitignore 配置

已配置忽略以下文件/目录：
- `node_modules/` - 依赖包
- `dist/` - 构建产物
- `coverage/` - 测试覆盖率报告
- `.env*` - 环境变量文件
- IDE 配置文件

---

## 🎯 使用场景

### 场景 1: 日常开发

```bash
# 1. 本地开发
npm run dev

# 2. 运行测试
npm test

# 3. 检查代码规范
npm run lint

# 4. 提交代码
git add .
git commit -m "feat: add new feature"
git push origin main

# 5. GitHub Actions 自动运行 CI/CD
# 查看结果：GitHub → Actions 标签页
```

### 场景 2: 创建 PR

```bash
# 1. 创建新分支
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "feat: implement new feature"
git push origin feature/new-feature

# 3. 在 GitHub 上创建 PR
# CI/CD 自动运行，检查结果会显示在 PR 页面

# 4. 如果所有检查通过 ✅ → 可以合并
# 5. 如果有检查失败 ❌ → 修复后重新提交
```

### 场景 3: 发布新版本

```bash
# 1. 更新版本号
npm version patch  # 或 minor, major

# 2. 提交并推送
git push origin main --tags

# 3. GitHub Actions 自动发布到 npm
# 查看结果：GitHub → Actions 标签页 → publish job
```

---

## 🛠️ 故障排查

### 问题 1: CI/CD 失败 - ESLint 错误

**症状**: Code Quality Check job 失败

**解决**:
```bash
# 1. 本地运行 ESLint
npm run lint

# 2. 查看错误信息并修复
npm run lint:fix  # 自动修复可修复的问题

# 3. 手动修复剩余问题

# 4. 重新提交
git add .
git commit -m "fix: resolve eslint errors"
git push
```

### 问题 2: CI/CD 失败 - 测试失败

**症状**: Run Tests job 失败

**解决**:
```bash
# 1. 本地运行测试
npm test

# 2. 查看失败的测试并修复

# 3. 重新提交
git add .
git commit -m "fix: fix failing tests"
git push
```

### 问题 3: CI/CD 失败 - 构建失败

**症状**: Build Package job 失败

**解决**:
```bash
# 1. 本地构建
npm run build

# 2. 查看错误信息并修复

# 3. 重新提交
git add .
git commit -m "fix: fix build errors"
git push
```

### 问题 4: 自动发布失败

**症状**: Publish to npm job 失败

**可能原因**:
1. NPM_TOKEN 未配置或过期
2. 版本号已存在
3. 网络问题

**解决**:
1. 检查 NPM_TOKEN secret 是否正确配置
2. 更新版本号：`npm version patch`
3. 手动发布：`npm publish`

---

## 📈 最佳实践

### 1. 提交前本地检查

```bash
# 养成习惯，提交前运行
npm run lint
npm test
npm run build
```

### 2. 使用 Conventional Commits

```bash
# 功能新增
git commit -m "feat: add new feature"

# Bug 修复
git commit -m "fix: resolve issue #123"

# 文档更新
git commit -m "docs: update README"

# 代码重构
git commit -m "refactor: improve code structure"

# 性能优化
git commit -m "perf: optimize bundle size"

# 测试相关
git commit -m "test: add unit tests"

# 构建相关
git commit -m "build: update dependencies"
```

### 3. 定期更新依赖

```bash
# 每月检查一次依赖更新
npm outdated

# 更新依赖
npm update

# 测试确保一切正常
npm test
npm run build
```

### 4. 监控 CI/CD 状态

- 设置 GitHub Actions 通知（邮件、Slack 等）
- 定期检查 Actions 标签页
- 及时处理失败的构建

---

##  完成清单

- [x] 创建 `.github/workflows/ci-cd.yml` - CI/CD 工作流配置
- [x] 创建 `eslint.config.js` - ESLint 配置（v9+ 格式）
- [x] 添加 `lint` 和 `lint:fix` 脚本到 package.json
- [x] 安装 ESLint 相关依赖
- [x] 修复所有 ESLint 错误和警告
- [x] 验证构建和测试正常
- [x] 创建 CI/CD 使用指南文档

---

## 📚 相关文档

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [ESLint 官方文档](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Vitest 官方文档](https://vitest.dev/)

---

**CI/CD 配置完成，项目已达到生产级质量标准！** 🎉
