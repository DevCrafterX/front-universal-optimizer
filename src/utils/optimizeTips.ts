import chalk from 'chalk'
import { OptimizeConfig } from '../config/default.config'

export function printOptTips(config: OptimizeConfig) {
  // 只在开发环境且首次调用时打印
  if ((globalThis as any).__OPT_TIPS_PRINTED__) {return
  }(globalThis as any).__OPT_TIPS_PRINTED__ = true
  
  console.log(chalk.blue('\n========== 前端代码优化建议清单 =========='))
  
  if (config.routeLazyLoad) {
    console.log(chalk.green('✅ 已开启路由懒加载优化能力'))
    console.log(chalk.yellow('💡 优化方案：'))
    console.log(chalk.gray('原写法(全量引入)：'))
    console.log(`import Home from '@/views/Home.vue'
{ path: '/', component: Home }`)
    console.log(chalk.gray('推荐优化写法(按需懒加载)：'))
    console.log('{ path: \'/\', component: () => import(\'@/views/Home.vue\') }\n')
  }
  
  if (config.imageWebpConvert) {
    console.log(chalk.green('✅ 已开启图片WebP压缩优化'))
    console.log(chalk.yellow('💡 优化方案：'))
    console.log('<img src="xxx.webp" loading="lazy" />\n')
  }
  
  if (config.autoDebounce || config.autoThrottle) {
    console.log(chalk.green('✅ 已启用防抖/节流工具'))
    console.log('import { useDebounce, useThrottle } from \'front-universal-optimizer\'')
  }
  
  console.log(chalk.blue('=========================================\n'))
  console.log(chalk.gray('提示：以上仅为优化建议，不强制修改，原有代码可正常运行'))
}
