# 发布指南

## 📦 发布到 npm

### 发布前准备

```bash
# 1. 确保代码已提交
git status

# 2. 运行测试
npm test

# 3. 构建项目
npm run build

# 4. 检查构建产物
ls -la dist/

# 5. 本地测试（可选）
npm link
cd /path/to/test-project
npm link front-universal-optimizer
```

### 发布步骤

```bash
# 1. 更新版本号（选择其一）
npm version patch  # 1.2.0 -> 1.2.1（补丁版本）
npm version minor  # 1.2.0 -> 1.3.0（小版本）
npm version major  # 1.2.0 -> 2.0.0（大版本）

# 2. 推送到 GitHub
git push && git push --tags

# 3. 发布到 npm
npm publish

# 4. 验证发布
npm info front-universal-optimizer
```

## 🏷️ 版本规范

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

- **MAJOR** (主版本号): 不兼容的 API 修改
- **MINOR** (次版本号): 向下兼容的功能性新增
- **PATCH** (补丁号): 向下兼容的问题修正

### 版本号示例

```
1.2.0
│ │ └─ 补丁版本（bug 修复）
│ └─── 小版本（新功能）
└───── 主版本（破坏性更新）
```

## 📝 CHANGELOG

每次发布时应更新 CHANGELOG.md，格式如下：

```markdown
# 更新日志

## [1.2.0] - 2024-01-15

### 新增
- 智能代码扫描功能
- 自定义规则扩展

### 修复
- 修复 Babel 依赖冲突
- 修复旧项目兼容性问题

### 优化
- 减少打包体积 90%
- 提升扫描速度
```

## 🔍 发布后验证

```bash
# 1. 检查 npm 包
npm view front-universal-optimizer

# 2. 在新项目中测试
mkdir test-project && cd test-project
npm init -y
npm install front-universal-optimizer

# 3. 验证安装
node -e "const opt = require('front-universal-optimizer'); console.log(opt)"
```

## 🚨 注意事项

### 发布前
- ✅ 所有测试通过
- ✅ 文档已更新
- ✅ CHANGELOG 已更新
- ✅ 无未提交的代码
- ✅ 构建产物正确

### 发布后
- ✅ GitHub Release 已创建
- ✅ CHANGELOG 已更新
- ✅ 文档已同步

## 📊 当前版本信息

- **当前版本**: 1.2.0
- **Node.js 要求**: >= 18.0.0
- **许可证**: MIT
- **包大小**: ~50KB（不含 Babel）
