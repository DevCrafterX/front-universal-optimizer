import chalk from 'chalk'
import { OptimizeConfig } from '../config/default.config'
import { FrameType } from '../core/frameAdapter'

// AST 分析结果接口
interface AnalysisResult {
  hasRouteLazyLoad: boolean
  hasImageWithoutLazy: string[]
  hasUnusedImports: string[]
  hasDangerousAPI: string[]
  hasMissingMemo: string[]
  suggestions: string[]
}

// 简单的代码分析引擎（基于正则和简单解析，无需完整 AST 即可运行）
function analyzeCodeBase(code: string, frame: FrameType): AnalysisResult {
  const result: AnalysisResult = {
    hasRouteLazyLoad: false,
    hasImageWithoutLazy: [],
    hasUnusedImports: [],
    hasDangerousAPI: [],
    hasMissingMemo: [],
    suggestions: []
  }

  // 1. 检测路由懒加载
  const hasStaticImport = /import\s+\w+\s+from\s+['"]@\/views\/['"]/g.test(code)
  const hasLazyImport = /import\s*\(\s*['"]@\/views\/['"]/g.test(code)
  if (hasStaticImport && !hasLazyImport) {
    result.suggestions.push('⚠️  检测到静态路由导入，建议使用懒加载：() => import(\'@/views/xxx\')')
  } else if (hasLazyImport) {
    result.hasRouteLazyLoad = true
  }

  // 2. 检测图片缺少 lazy loading
  const imgMatches = code.match(/<img[^>]*src=["'][^"'>]*["'][^>]*>/g)
  if (imgMatches) {
    imgMatches.forEach(img => {
      if (!img.includes('loading="lazy"') && !img.includes('lazy')) {
        result.hasImageWithoutLazy.push(img.substring(0, 50) + '...')
      }
    })
  }

  // 3. 检测潜在的危险 API
  if (/\beval\s*\(/.test(code)) {
    result.hasDangerousAPI.push('eval()')
  }
  if (/document\.write\s*\(/.test(code)) {
    result.hasDangerousAPI.push('document.write()')
  }
  if (/innerHTML\s*=/.test(code)) {
    result.hasDangerousAPI.push('innerHTML 赋值（存在 XSS 风险）')
  }

  // 4. 框架特定检测
  if (frame === FrameType.REACT) {
    // 检测 React 组件中缺少 useMemo/useCallback
    if (/const\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(code) && !/useMemo|useCallback/.test(code)) {
      result.suggestions.push('⚛️  React 组件中建议使用 useMemo/useCallback 优化渲染')
    }
  } else if (frame === FrameType.VUE3) {
    // 检测 Vue3 中未使用 ref/reactive 包装
    if (/const\s+\w+\s*=\s*{/.test(code) && !/ref\(|reactive\(/.test(code)) {
      result.suggestions.push('🟢 Vue3 中建议使用 ref() 或 reactive() 包装响应式数据')
    }
  }

  return result
}

export function printOptTips(config: OptimizeConfig, frame?: FrameType, codeSample?: string) {
  // 只在开发环境且首次调用时打印
  if ((globalThis as any).__OPT_TIPS_PRINTED__) {return}
  ;(globalThis as any).__OPT_TIPS_PRINTED__ = true
  
  console.log(chalk.blue('\n========== 前端代码优化建议清单 =========='))
  
  // 如果有代码样本，进行智能分析
  if (codeSample && frame) {
    const analysis = analyzeCodeBase(codeSample, frame)
    
    if (analysis.suggestions.length > 0) {
      console.log(chalk.yellow('\n🔍 智能分析结果：'))
      analysis.suggestions.forEach((s, i) => {
        console.log(chalk.yellow(`  ${i + 1}. ${s}`))
      })
    }
    
    if (analysis.hasImageWithoutLazy.length > 0) {
      console.log(chalk.yellow('\n🖼️  发现未使用 lazy loading 的图片：'))
      analysis.hasImageWithoutLazy.forEach(img => {
        console.log(chalk.gray(`    ${img}`))
      })
      console.log(chalk.green('  💡 建议：<img src="xxx.webp" loading="lazy"  alt=""/>'))
    }
    
    if (analysis.hasDangerousAPI.length > 0) {
      console.log(chalk.red('\n🚨 检测到潜在危险 API：'))
      analysis.hasDangerousAPI.forEach(api => {
        console.log(chalk.red(`    ⚠️  ${api}`))
      })
    }
  }
  
  // 基于配置的传统提示
  console.log(chalk.green('\n📦 已启用的优化能力：'))
  
  if (config.routeLazyLoad) {
    console.log(chalk.green('  ✅ 路由懒加载优化'))
    console.log(chalk.gray('     示例：{ path: \'/\', component: () => import(\'@/views/Home.vue\') }'))
  }
  
  if (config.imageWebpConvert) {
    console.log(chalk.green('  ✅ 图片 WebP 压缩优化'))
    console.log(chalk.gray('     示例：<img src="xxx.webp" loading="lazy"  alt=""/>'))
  }
  
  if (config.autoDebounce || config.autoThrottle) {
    console.log(chalk.green('  ✅ 防抖/节流工具'))
    console.log(chalk.gray('     import { useDebounce, useThrottle } from \'front-universal-optimizer\''))
  }
  
  if (config.enableXSSDefend) {
    console.log(chalk.green('  ✅ XSS 安全防护'))
    console.log(chalk.gray('     使用 SecurityGuard.xssEscape() 转义用户输入'))
  }
  
  if (config.safeRequestFilter) {
    console.log(chalk.green('  ✅ 敏感请求字段检测'))
    console.log(chalk.gray('     自动检测 password、token 等敏感字段'))
  }
  
  console.log(chalk.blue('\n=========================================\n'))
  console.log(chalk.gray('提示：以上建议可根据项目实际情况选择性采纳'))
}
