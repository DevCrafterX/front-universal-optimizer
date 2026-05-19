import type { Plugin, UserConfig } from 'vite'
import { OptimizeConfig } from '../config/default.config'
import { SecurityGuard } from '../core/securityGuard'

export default function ViteOptPlugin(config: OptimizeConfig): Plugin {
  return {
    name: 'front-universal-optimizer-vite',
    enforce: 'post',

    config(viteConfig) {
      if (config.chunkSplit && viteConfig.build?.rollupOptions) {
        // 使用更通用的分包策略，避免硬编码特定库
        const output = viteConfig.build.rollupOptions.output as any
        const existingManualChunks = output?.manualChunks
        
        viteConfig.build.rollupOptions.output = {
          ...output,
          manualChunks: (id: string) => {
            // 如果用户已有自定义分包逻辑，保留它
            if (typeof existingManualChunks === 'function') {
              return existingManualChunks(id)
            }
            
            // 默认将 node_modules 中的包分到 vendor chunk
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
      if (config.brotliCompress && viteConfig.build) {
        (viteConfig.build as any).brotliSize = true
      }
      return viteConfig
    },

    transform(code, id) {
      // 只处理 JS/TS 文件
      if (!/\.[jt]sx?$/.test(id)) return
      
      if (config.env === 'production' && config.clearConsole) {
        // 更完善的 console 清理（包括 warn, error 等）
        return code.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, '')
      }
      return null // 返回 null 表示不转换
    },

    transformIndexHtml(html) {
      let res = html
      if (config.enableCSP) res = SecurityGuard.injectCSP(res)
      if (config.domPrefetch) {
        // 使用通用占位符，让用户自行配置
        res = res.replace('<head>', `<head><!-- dns-prefetch 建议：添加 <link rel="dns-prefetch" href="//your-api-domain.com"> -->`)
      }
      return res
    }
  }
}
