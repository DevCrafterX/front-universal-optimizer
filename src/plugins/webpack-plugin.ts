import { OptimizeConfig } from '../config/default.config'

export default function WebpackOptPlugin(config: OptimizeConfig) {
  return {
    apply(compiler: any) {
      compiler.options.optimization = compiler.options.optimization || {}
      
      if (config.chunkSplit) {
        compiler.options.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: { 
              test: /[\\/]node_modules[\\/]/, 
              name: 'vendors', 
              chunks: 'all',
              priority: 10 // 设置优先级，避免与其他配置冲突
            }
          }
        }
      }
      
      if (config.env === 'production' && config.clearConsole) {
        try {
          const TerserPlugin = require('terser-webpack-plugin')
          compiler.options.optimization.minimizer = compiler.options.optimization.minimizer || []
          compiler.options.optimization.minimizer.push(
            new TerserPlugin({ 
              terserOptions: { 
                compress: { 
                  drop_console: true,
                  drop_debugger: true // 同时移除 debugger
                } 
              } 
            })
          )
        } catch (e) {
          console.warn('[Webpack Plugin] terser-webpack-plugin 未安装，跳过 console 清理')
        }
      }
    }
  }
}
