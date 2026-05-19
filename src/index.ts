import { defaultConfig, OptimizeConfig } from './config/default.config'
import { detectFrame, getFrameOptRule, FrameType } from './core/frameAdapter'
import { SecurityGuard } from './core/securityGuard'
import { useDebounce } from './hooks/useDebounce'
import { useThrottle } from './hooks/useThrottle'
import { useAutoClear } from './hooks/useAutoClear'
import { useVirtualList } from './hooks/useVirtualList'
import ViteOptPlugin from './plugins/vite-plugin'
import { printOptTips } from './utils/optimizeTips'

export function createCodeOptimizer(custom?: Partial<OptimizeConfig>) {
  const mergeCfg = { ...defaultConfig, ...custom }
  
  // 处理 chunkSplit 配置合并
  if (custom?.chunkSplit && typeof custom.chunkSplit === 'object' && typeof defaultConfig.chunkSplit === 'object') {
    mergeCfg.chunkSplit = {
      ...defaultConfig.chunkSplit,
      ...custom.chunkSplit
    }
  }
  
  const frame = detectFrame()
  const frameRule = getFrameOptRule(frame)

  return {
    config: mergeCfg,
    frame,
    frameRule,
    vitePlugin: ViteOptPlugin(mergeCfg),
    security: SecurityGuard,
    useDebounce,
    useThrottle,
    useAutoClear,
    useVirtualList,
    
    // 提供显式的方法让用户控制何时执行
    enableProductionMode: () => {
      if (mergeCfg.env === 'production') {
        SecurityGuard.checkDangerApi()
      }
    },
    
    showOptimizationTips: () => {
      if (mergeCfg.env === 'development') {
        printOptTips(mergeCfg)
      }
    }
  }
}

// 导出工厂函数，不立即执行
export type { OptimizeConfig }
export { FrameType, detectFrame, getFrameOptRule }
export { useDebounce, useThrottle, useAutoClear, useVirtualList }
