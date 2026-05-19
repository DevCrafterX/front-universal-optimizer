import type { Plugin } from 'vite'
import { OptimizeConfig, ChunkSplitConfig } from '../config/default.config'

function createFineGrainedChunks(config: ChunkSplitConfig) {
  const customRules = config.customRules || {}
  
  return (id: string): string | undefined => {
    if (!id.includes('node_modules')) {
      return undefined
    }

    // 先检查自定义规则
    for (const [chunkName, testFn] of Object.entries(customRules)) {
      if (testFn(id)) {
        return chunkName
      }
    }

    // 默认细粒度分包策略
    if (id.includes('react') || id.includes('react-dom')) {
      return 'vendor-react'
    }
    if (id.includes('vue')) {
      return 'vendor-vue'
    }
    if (id.includes('lodash') || id.includes('underscore')) {
      return 'vendor-lodash'
    }
    if (id.includes('axios') || id.includes('fetch')) {
      return 'vendor-http'
    }
    if (id.includes('moment') || id.includes('dayjs') || id.includes('date-fns')) {
      return 'vendor-date'
    }
    
    // 其他第三方库统一打包
    return 'vendor'
  }
}

export default function ViteOptPlugin(config: OptimizeConfig): Plugin {
  return {
    name: 'front-universal-optimizer-vite',
    enforce: 'post',

    config(viteConfig) {
      const chunkSplitConfig = typeof config.chunkSplit === 'object'
        ? config.chunkSplit
        : { enable: config.chunkSplit }

      // Vite 5 兼容：使用返回新对象的方式，避免直接修改引用
      const additionalConfig: any = {}
      
      if (chunkSplitConfig.enable) {
        additionalConfig.build = {
          rollupOptions: {
            output: {
              manualChunks: (id: string) => {
                // 获取用户已有的 manualChunks 配置
                const existingOutput = viteConfig.build?.rollupOptions?.output
                let existingManualChunks: any = undefined
                
                // 处理 output 可能是数组或对象的情况
                if (Array.isArray(existingOutput)) {
                  existingManualChunks = existingOutput[0]?.manualChunks
                } else if (typeof existingOutput === 'object') {
                  existingManualChunks = (existingOutput as any).manualChunks
                }
                
                // 如果用户已有自定义分包逻辑，优先保留它
                if (typeof existingManualChunks === 'function') {
                  return existingManualChunks(id)
                }
                
                // 根据策略生成分包
                const strategy = chunkSplitConfig.strategy || 'fine-grained'
                if (strategy === 'fine-grained' || strategy === 'custom') {
                  return createFineGrainedChunks(chunkSplitConfig)(id)
                } else {
                  // 默认策略：所有 node_modules 打包到 vendor
                  if (id.includes('node_modules')) {
                    return 'vendor'
                  }
                }
              }
            }
          }
        }
      }
      
      if (config.brotliCompress) {
        additionalConfig.build = {
          ...(additionalConfig.build || {}),
          brotliSize: true
        }
      }
      
      return Object.keys(additionalConfig).length > 0 ? additionalConfig : undefined
    },

    transform(code, id) {
      // 只处理 JS/TS 文件
      if (!/\.[jt]sx?$/.test(id)) {return null}
      
      if (config.env === 'production' && config.clearConsole) {
        const strategy = config.consoleRemovalStrategy || 'babel'
        
        if (strategy === 'regex') {
          // 简单的正则替换（保留用于兼容）
          return code.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, '')
        } else {
          // Babel 策略：使用注释标记，让用户自行配置 babel 插件
          // 这里添加标记，实际转换由用户的 babel 配置完成
          console.warn('[front-universal-optimizer] clearConsole 启用，请确保项目已配置 @babel/plugin-transform-remove-console')
          return null
        }
      }
      return null
    },

    transformIndexHtml(html) {
      let res = html
      if (config.enableCSP) {
        const cspPolicy = config.cspPolicy || "default-src 'self'"
        const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${cspPolicy}">`
        res = res.replace('<head>', `<head>${cspMeta}`)
      }
      if (config.domPrefetch) {
        res = res.replace('<head>', '<head><!-- dns-prefetch 建议：添加 <link rel="dns-prefetch" href="//your-api-domain.com"> -->')
      }
      return res
    }
  }
}
