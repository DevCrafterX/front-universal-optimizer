import { defaultConfig, OptimizeConfig } from './config/default.config'
import { detectFrame, getFrameOptRule, getFrameSpecificRecommendations, FrameType } from './core/frameAdapter'
import { SecurityGuard } from './core/securityGuard'
import { CodeScanner, ScanResult, CustomScanRule } from './core/codeScanner'
import { useDebounce } from './hooks/useDebounce'
import { useThrottle } from './hooks/useThrottle'
import { useAutoClear } from './hooks/useAutoClear'
import { useVirtualList } from './hooks/useVirtualList'
import ViteOptPlugin from './plugins/vite-plugin'
import { printOptTips } from './utils/optimizeTips'
import { generateScanReport, generateQuickTips } from './utils/reportGenerator'

export function createCodeOptimizer(custom?: Partial<OptimizeConfig>) {
  const mergeCfg = { ...defaultConfig, ...custom }
  
  // 处理 chunkSplit 配置合并
  if (custom?.chunkSplit && typeof custom.chunkSplit === 'object' && typeof defaultConfig.chunkSplit === 'object') {
    mergeCfg.chunkSplit = {
      ...defaultConfig.chunkSplit,
      ...custom.chunkSplit
    }
  }
  
  const frameResult = detectFrame()
  const frame = frameResult.type
  const frameRule = getFrameOptRule(frameResult)

  // 创建代码扫描器实例
  const scanner = new CodeScanner({
    useAST: mergeCfg.env === 'development'  // 开发环境使用 AST，生产环境使用正则
  })

  return {
    config: mergeCfg,
    frame,
    frameRule,
    frameRecommendations: getFrameSpecificRecommendations(frameResult),
    vitePlugin: ViteOptPlugin(mergeCfg),
    security: SecurityGuard,
    useDebounce,
    useThrottle,
    useAutoClear,
    useVirtualList,
    
    // 智能代码扫描功能
    scanCode: (files: Array<{path: string, code: string}>) => {
      scanner.reset()
      files.forEach(({path, code}) => {
        scanner.scanFile(path, code)
      })
      return scanner.getResult()
    },
    
    // 提供显式的方法让用户控制何时执行
    enableProductionMode: () => {
      if (mergeCfg.env === 'production') {
        SecurityGuard.checkDangerApi(true)
        SecurityGuard.frameworkSecurityWarn(frame)
      }
    },
    
    // 显示智能扫描报告
    showOptimizationTips: (files?: Array<{path: string, code: string}>) => {
      if (mergeCfg.env === 'development') {
        if (files && files.length > 0) {
          // 智能扫描模式
          scanner.scanFile(files[0].path, files[0].code)
          generateScanReport(scanner.getResult())
        } else {
          // 传统提示模式
          printOptTips(mergeCfg, frame)
        }
        SecurityGuard.frameworkSecurityWarn(frame)
      }
    },
    
    // 快速扫描提示
    quickScan: (files: Array<{path: string, code: string}>) => {
      scanner.reset()
      files.forEach(({path, code}) => {
        scanner.scanFile(path, code)
      })
      generateQuickTips(scanner.getResult())
      return scanner.getResult()
    }
  }
}

// 导出工厂函数，不立即执行
export type { OptimizeConfig }
export { FrameType, detectFrame, getFrameOptRule, getFrameSpecificRecommendations }
export { useDebounce, useThrottle, useAutoClear, useVirtualList }
export { SecurityGuard }
export { CodeScanner, ScanResult, CustomScanRule }
