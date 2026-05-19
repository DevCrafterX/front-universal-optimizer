import * as t from '@babel/types'

// 扫描问题类型
export interface ScanIssue {
  type: 'performance' | 'security' | 'seo' | 'bundle' | 'best-practice'
  severity: 'high' | 'medium' | 'low'
  file: string
  line: number
  column: number
  message: string
  suggestion: string
  codeFrame?: string
}

// 扫描结果
export interface ScanResult {
  totalFiles: number
  scannedFiles: number
  issues: ScanIssue[]
  summary: {
    performance: number
    security: number
    seo: number
    bundle: number
    bestPractice: number
  }
}

// 自定义扫描规则
export interface CustomScanRule {
  name: string
  test: (filePath: string, code: string) => ScanIssue[]
}

// 代码扫描器
export class CodeScanner {
  private issues: ScanIssue[] = []
  private totalFiles = 0
  private scannedFiles = 0
  private customRules: CustomScanRule[] = []
  private useAST: boolean = true  // 是否使用 AST 分析

  constructor(options?: { useAST?: boolean }) {
    // 检测 Babel 是否可用
    if (options?.useAST !== undefined) {
      this.useAST = options.useAST
    } else {
      // 自动检测：尝试导入 Babel，失败则降级为正则模式
      try {
        require('@babel/parser')
        this.useAST = true
      } catch {
        this.useAST = false
      }
    }
  }

  // 添加自定义扫描规则
  addCustomRule(rule: CustomScanRule) {
    this.customRules.push(rule)
  }

  // 扫描单个文件
  scanFile(filePath: string, code: string): ScanIssue[] {
    this.totalFiles++
    this.scannedFiles++

    try {
      // 根据文件类型选择扫描策略
      const fileExt = filePath.split('.').pop()?.toLowerCase()
      
      // Vue SFC 文件特殊处理
      if (fileExt === 'vue') {
        this.scanVueFile(filePath, code)
      } 
      // Svelte 文件
      else if (fileExt === 'svelte') {
        this.scanSvelteFile(filePath, code)
      }
      // JSX/TSX 和普通 JS/TS 文件
      else {
        // 优先使用 AST 分析
        if (this.useAST) {
          this.scanWithAST(filePath, code, fileExt)
        } else {
          // 降级为正则扫描
          this.scanWithRegex(filePath, code)
        }
      }

      // 执行自定义规则
      this.customRules.forEach(rule => {
        const issues = rule.test(filePath, code)
        this.issues.push(...issues)
      })

    } catch {
      // AST 解析失败，降级为正则
      if (this.useAST) {
        console.warn(`[Scanner] AST 解析失败，降级为正则模式: ${filePath}`)
        this.scanWithRegex(filePath, code)
      }
    }

    return this.issues
  }

  // AST 扫描
  private scanWithAST(filePath: string, code: string, fileExt?: string) {
    // 动态导入 Babel（避免打包）
    let parser: any
    let traverse: any

    try {
      parser = require('@babel/parser')
      traverse = require('@babel/traverse').default
    } catch {
      // Babel 不可用，降级为正则
      this.scanWithRegex(filePath, code)
      return
    }

    try {
      // 根据文件扩展名配置 Babel 插件
      const plugins: string[] = ['decorators-legacy']
      
      // JSX/TSX 文件启用 JSX 支持
      if (fileExt === 'jsx' || fileExt === 'tsx') {
        plugins.push('jsx')
      }
      
      // TS/TSX 文件启用 TypeScript 支持
      if (fileExt === 'ts' || fileExt === 'tsx') {
        plugins.push('typescript')
      }
      
      // 解析代码为 AST
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins
      })

      // 执行各种检测
      this.checkRouteLazyLoad(filePath, code, ast, traverse)
      this.checkImageOptimization(filePath, code, ast, traverse)
      this.checkDebounceThrottle(filePath, code, ast, traverse)
      this.checkMemoryLeaks(filePath, code, ast, traverse)
      this.checkLargeImports(filePath, code, ast, traverse)
    } catch {
      // 解析失败，降级为正则
      this.scanWithRegex(filePath, code)
    }
  }

  // 获取扫描结果
  getResult(): ScanResult {
    const summary = {
      performance: this.issues.filter(i => i.type === 'performance').length,
      security: this.issues.filter(i => i.type === 'security').length,
      seo: this.issues.filter(i => i.type === 'seo').length,
      bundle: this.issues.filter(i => i.type === 'bundle').length,
      bestPractice: this.issues.filter(i => i.type === 'best-practice').length
    }

    return {
      totalFiles: this.totalFiles,
      scannedFiles: this.scannedFiles,
      issues: this.issues,
      summary
    }
  }

  // 重置扫描器
  reset() {
    this.issues = []
    this.totalFiles = 0
    this.scannedFiles = 0
  }

  // ========== 检测规则 ==========

  // 1. 检测路由懒加载（白屏优化）
  private checkRouteLazyLoad(filePath: string, code: string, ast: any, traverse: any) {
    const staticImports = new Map<string, number>()

    traverse(ast, {
      ImportDeclaration(path) {
        const node = path.node as t.ImportDeclaration
        const importPath = node.source.value
        
        // 检测是否是路由相关的静态导入
        if (
          importPath.includes('/views/') ||
          importPath.includes('/pages/') ||
          importPath.includes('/routes/') ||
          importPath.includes('/router/')
        ) {
          staticImports.set(importPath, node.loc?.start.line || 0)
        }
      }
    })

    // 报告问题
    staticImports.forEach((line, importPath) => {
      this.issues.push({
        type: 'performance',
        severity: 'high',
        file: filePath,
        line,
        column: 1,
        message: `检测到静态路由导入: ${importPath}`,
        suggestion: `建议改为懒加载: const component = () => import('${importPath}')`,
        codeFrame: this.getCodeFrame(code, line)
      })
    })
  }

  // 2. 检测图片优化
  private checkImageOptimization(filePath: string, code: string, _ast: any, _traverse: any) {
    // 使用正则检测 JSX/模板中的图片
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g
    let match

    while ((match = imgRegex.exec(code)) !== null) {
      const imgTag = match[0]
      const line = code.substring(0, match.index).split('\n').length

      // 检测是否缺少 lazy loading
      if (!imgTag.includes('loading="lazy"')) {
        this.issues.push({
          type: 'performance',
          severity: 'medium',
          file: filePath,
          line,
          column: 1,
          message: '图片未使用懒加载',
          suggestion: '添加 loading="lazy" 属性: <img src="..." loading="lazy"  alt=""/>',
          codeFrame: imgTag
        })
      }

      // 检测是否可以使用 WebP
      const src = match[1]
      if (/\.(jpg|jpeg|png|gif)$/i.test(src)) {
        this.issues.push({
          type: 'performance',
          severity: 'low',
          file: filePath,
          line,
          column: 1,
          message: `图片可能可以转换为 WebP 格式: ${src}`,
          suggestion: '考虑使用 WebP 格式以减小文件体积',
          codeFrame: imgTag
        })
      }
    }
  }

  // 3. 检测防抖/节流使用点
  private checkDebounceThrottle(filePath: string, code: string, ast: any, traverse: any) {
    const potentialHandlers: Array<{name: string, line: number, eventType: string}> = []

    traverse(ast, {
      // 检测事件监听器
      CallExpression(path) {
        const node = path.node as t.CallExpression
        const callee = node.callee as any

        // addEventListener
        if (
          callee.property?.name === 'addEventListener' ||
          (callee.name === 'addEventListener')
        ) {
          const eventType = node.arguments[0] as t.StringLiteral
          const handler = node.arguments[1]
          
          if (eventType?.value && handler) {
            const events = ['scroll', 'resize', 'mousemove', 'keypress', 'input', 'touchmove']
            if (events.includes(eventType.value)) {
              potentialHandlers.push({
                name: '事件监听器',
                line: node.loc?.start.line || 0,
                eventType: eventType.value
              })
            }
          }
        }
      },

      // 检测搜索/输入相关的函数
      FunctionDeclaration(path) {
        const node = path.node as t.FunctionDeclaration
        const funcName = node.id?.name || ''
        
        if (
          (funcName.toLowerCase().includes('search') ||
           funcName.toLowerCase().includes('input') ||
           funcName.toLowerCase().includes('fetch')) &&
          !code.includes('debounce') &&
          !code.includes('throttle')
        ) {
          potentialHandlers.push({
            name: funcName,
            line: node.loc?.start.line || 0,
            eventType: '函数调用'
          })
        }
      }
    })

    // 报告建议使用防抖/节流
    potentialHandlers.forEach(({name, line, eventType}) => {
      this.issues.push({
        type: 'performance',
        severity: 'medium',
        file: filePath,
        line,
        column: 1,
        message: `${name} (${eventType}) 可能需要防抖或节流优化`,
        suggestion: `考虑使用 useDebounce 或 useThrottle 包装该${eventType.includes('函数') ? '函数' : '事件处理器'}`,
        codeFrame: this.getCodeFrame(code, line)
      })
    })
  }

  // 4. 检测内存泄漏风险
  private checkMemoryLeaks(filePath: string, code: string, ast: any, traverse: any) {
    traverse(ast, {
      CallExpression(path) {
        const node = path.node as t.CallExpression
        const callee = node.callee as any

        // setTimeout/setInterval 未清理
        if (callee.name === 'setTimeout' || callee.name === 'setInterval') {
          const line = node.loc?.start.line || 0
          
          // 简单检测：查找附近是否有 clearTimeout/clearInterval
          const beforeCode = code.substring(0, node.start || 0)
          const hasClear = beforeCode.includes('clearTimeout') || beforeCode.includes('clearInterval')

          if (!hasClear) {
            this.issues.push({
              type: 'best-practice',
              severity: 'medium',
              file: filePath,
              line,
              column: 1,
              message: `检测到 ${callee.name}，请确保在适当时机清理`,
              suggestion: '使用 useAutoClear 工具自动管理定时器清理',
              codeFrame: this.getCodeFrame(code, line)
            })
          }
        }
      }
    })
  }

  // 5. 检测大型导入（打包优化）
  private checkLargeImports(filePath: string, code: string, ast: any, traverse: any) {
    const largeLibraries = [
      'lodash',
      'moment',
      'antd',
      'element-ui',
      'element-plus',
      '@material-ui/core',
      '@mui/material'
    ]

    traverse(ast, {
      ImportDeclaration(path) {
        const node = path.node as t.ImportDeclaration
        const importPath = node.source.value

        // 检测是否完整导入了大型库
        largeLibraries.forEach(lib => {
          if (importPath === lib && !importPath.includes('/')) {
            const line = node.loc?.start.line || 0
            
            this.issues.push({
              type: 'bundle',
              severity: 'high',
              file: filePath,
              line,
              column: 1,
              message: `完整导入大型库: ${lib}，可能导致打包体积过大`,
              suggestion: `建议按需导入: import { specificFunction } from '${lib}'`,
              codeFrame: this.getCodeFrame(code, line)
            })
          }
        })
      }
    })
  }

  // 使用正则扫描（用于非 JS/TS 文件或 AST 解析失败时）
  private scanWithRegex(filePath: string, code: string) {
    const lines = code.split('\n')
  
    // 1. 检测路由静态导入
    lines.forEach((line, idx) => {
      // 检测 import X from '@/views/' 或 import X from '@/pages/'
      if (/^import\s+\w+\s+from\s+['"]@\/(views|pages|routes|router)\//.test(line)) {
        this.issues.push({
          type: 'performance',
          severity: 'high',
          file: filePath,
          line: idx + 1,
          column: 1,
          message: '检测到可能的静态路由导入',
          suggestion: '建议改为懒加载: const component = () => import(\'@/views/...\')',
          codeFrame: line.trim()
        })
      }
  
      // 2. 检测大型库完整导入
      if (/^import\s+\w+\s+from\s+['"](lodash|moment|antd|element-ui|element-plus)['"]/.test(line)) {
        const match = line.match(/from\s+['"]([^'"]+)['"]/)
        this.issues.push({
          type: 'bundle',
          severity: 'high',
          file: filePath,
          line: idx + 1,
          column: 1,
          message: `完整导入大型库: ${match?.[1]}`,
          suggestion: '建议按需导入: import { specificFunction } from \'...\'',
          codeFrame: line.trim()
        })
      }
  
      // 3. 检测图片缺少 lazy loading
      if (/<img[^>]*src=["'][^"'>]+["'][^>]*>/.test(line) && !line.includes('loading="lazy"')) {
        this.issues.push({
          type: 'performance',
          severity: 'medium',
          file: filePath,
          line: idx + 1,
          column: 1,
          message: '图片未使用懒加载',
          suggestion: '添加 loading="lazy" 属性',
          codeFrame: line.trim()
        })
      }
  
      // 4. 检测事件监听器（可能需要防抖/节流）
      if (/\.addEventListener\s*\(\s*['"](scroll|resize|mousemove|keypress|input|touchmove)['"]/.test(line)) {
        this.issues.push({
          type: 'performance',
          severity: 'medium',
          file: filePath,
          line: idx + 1,
          column: 1,
          message: '高频事件监听器可能需要防抖或节流优化',
          suggestion: '考虑使用 useDebounce 或 useThrottle 包装事件处理器',
          codeFrame: line.trim()
        })
      }
  
      // 5. 检测定时器（可能未清理）
      if (/\b(setTimeout|setInterval)\s*\(/.test(line) && !code.includes('clearTimeout') && !code.includes('clearInterval')) {
        this.issues.push({
          type: 'best-practice',
          severity: 'medium',
          file: filePath,
          line: idx + 1,
          column: 1,
          message: '检测到定时器，请确保在适当时机清理',
          suggestion: '使用 useAutoClear 工具自动管理定时器清理',
          codeFrame: line.trim()
        })
      }
    })
  }

  // 获取代码片段
  private getCodeFrame(code: string, line: number, contextLines = 2): string {
    const lines = code.split('\n')
    const start = Math.max(0, line - contextLines - 1)
    const end = Math.min(lines.length, line + contextLines)

    return lines.slice(start, end).map((l, idx) => {
      const num = start + idx + 1
      const marker = num === line ? '>>> ' : '    '
      return `${marker}${num} | ${l}`
    }).join('\n')
  }

  // ========== 特殊文件类型处理 ==========

  // 扫描 Vue SFC 文件
  private scanVueFile(filePath: string, code: string) {
    // 提取 <script> 部分
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    if (scriptMatch) {
      const scriptCode = scriptMatch[1]
      // 使用 AST 或正则扫描 script 部分
      if (this.useAST) {
        try {
          this.scanWithAST(filePath, scriptCode, 'ts')
        } catch {
          this.scanWithRegex(filePath, scriptCode)
        }
      } else {
        this.scanWithRegex(filePath, scriptCode)
      }
    }

    // 提取 <template> 部分进行模板扫描
    const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
    if (templateMatch) {
      const templateCode = templateMatch[1]
      // 对模板部分使用正则扫描（检测图片、链接等）
      this.scanVueTemplate(filePath, templateCode)
    }
  }

  // 扫描 Vue 模板部分
  private scanVueTemplate(filePath: string, templateCode: string) {
    const lines = templateCode.split('\n')
    
    lines.forEach((line, idx) => {
      // 检测图片缺少 lazy loading
      if (/<img[^>]*:[\s"']src[\s"'=/].*>/.test(line) || /<img[^>]*src[\s"'=/].*>/.test(line)) {
        if (!line.includes('loading="lazy"')) {
          this.issues.push({
            type: 'performance',
            severity: 'medium',
            file: filePath,
            line: idx + 1,
            column: 1,
            message: '图片未使用懒加载',
            suggestion: '添加 loading="lazy" 属性: <img src="..." loading="lazy" alt=""/>',
            codeFrame: line.trim()
          })
        }

        // 检测是否可以使用 WebP
        const srcMatch = line.match(/src=["']([^"']+)["']/)
        if (srcMatch && /\.(jpg|jpeg|png|gif)$/i.test(srcMatch[1])) {
          this.issues.push({
            type: 'performance',
            severity: 'low',
            file: filePath,
            line: idx + 1,
            column: 1,
            message: `图片可能可以转换为 WebP 格式: ${srcMatch[1]}`,
            suggestion: '考虑使用 WebP 格式以减小文件体积',
            codeFrame: line.trim()
          })
        }
      }

      // 检测 @click 等事件处理器（可能需要防抖）
      if (/@(click|input|scroll|mousemove|keypress)[="']/.test(line)) {
        const match = line.match(/@(click|input|scroll|mousemove|keypress)/)
        if (match) {
          const eventType = match[1]
          const highFreqEvents = ['input', 'scroll', 'mousemove', 'keypress']
          if (highFreqEvents.includes(eventType)) {
            this.issues.push({
              type: 'performance',
              severity: 'medium',
              file: filePath,
              line: idx + 1,
              column: 1,
              message: `高频事件 @${eventType} 可能需要防抖或节流优化`,
              suggestion: '考虑使用 useDebounce 或 useThrottle 包装事件处理器',
              codeFrame: line.trim()
            })
          }
        }
      }
    })
  }

  // 扫描 Svelte 文件
  private scanSvelteFile(filePath: string, code: string) {
    // 提取 <script> 部分
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    if (scriptMatch) {
      const scriptCode = scriptMatch[1]
      // 使用 AST 或正则扫描 script 部分
      if (this.useAST) {
        try {
          this.scanWithAST(filePath, scriptCode, 'ts')
        } catch {
          this.scanWithRegex(filePath, scriptCode)
        }
      } else {
        this.scanWithRegex(filePath, scriptCode)
      }
    }

    // 提取 HTML 模板部分
    const htmlCode = code.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    this.scanSvelteTemplate(filePath, htmlCode)
  }

  // 扫描 Svelte 模板部分
  private scanSvelteTemplate(filePath: string, templateCode: string) {
    const lines = templateCode.split('\n')
    
    lines.forEach((line, idx) => {
      // 检测图片缺少 lazy loading
      if (/<img[^>]*src[\s"'=/].*>/.test(line)) {
        if (!line.includes('loading="lazy"')) {
          this.issues.push({
            type: 'performance',
            severity: 'medium',
            file: filePath,
            line: idx + 1,
            column: 1,
            message: '图片未使用懒加载',
            suggestion: '添加 loading="lazy" 属性: <img src="..." loading="lazy" alt=""/>',
            codeFrame: line.trim()
          })
        }
      }

      // 检测 on:click 等事件处理器
      if (/on:(click|input|scroll|mousemove|keypress)[="']/.test(line)) {
        const match = line.match(/on:(click|input|scroll|mousemove|keypress)/)
        if (match) {
          const eventType = match[1]
          const highFreqEvents = ['input', 'scroll', 'mousemove', 'keypress']
          if (highFreqEvents.includes(eventType)) {
            this.issues.push({
              type: 'performance',
              severity: 'medium',
              file: filePath,
              line: idx + 1,
              column: 1,
              message: `高频事件 on:${eventType} 可能需要防抖或节流优化`,
              suggestion: '考虑使用 useDebounce 或 useThrottle 包装事件处理器',
              codeFrame: line.trim()
            })
          }
        }
      }
    })
  }
}
