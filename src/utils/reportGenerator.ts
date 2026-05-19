import chalk from 'chalk'
import { ScanResult, ScanIssue } from '../core/codeScanner'

// 生成扫描报告
export function generateScanReport(result: ScanResult): void {
  const { totalFiles, scannedFiles, issues, summary } = result

  console.log('\n')
  console.log(chalk.blue('╔══════════════════════════════════════════════════════════╗'))
  console.log(chalk.blue('║          front-universal-optimizer 扫描报告              ║'))
  console.log(chalk.blue('╚══════════════════════════════════════════════════════════╝'))
  console.log('\n')

  // 扫描概览
  console.log(chalk.cyan('📊 扫描概览:'))
  console.log(chalk.gray(`   总文件数: ${totalFiles}`))
  console.log(chalk.gray(`   已扫描: ${scannedFiles}`))
  console.log(chalk.gray(`   发现问题: ${issues.length}`))
  console.log('\n')

  // 问题统计
  console.log(chalk.cyan('📈 问题分类:'))
  console.log(chalk.yellow(`   ⚡ 性能优化: ${summary.performance} 个`))
  console.log(chalk.red(`   🔒 安全问题: ${summary.security} 个`))
  console.log(chalk.green(`   🔍 SEO 优化: ${summary.seo} 个`))
  console.log(chalk.magenta(`   📦 打包优化: ${summary.bundle} 个`))
  console.log(chalk.blue(`   💡 最佳实践: ${summary.bestPractice} 个`))
  console.log('\n')

  if (issues.length === 0) {
    console.log(chalk.green('✅ 太棒了！没有发现任何问题！'))
    console.log('\n')
    return
  }

  // 按严重程度排序
  const severityOrder = { high: 0, medium: 1, low: 2 }
  const sortedIssues = [...issues].sort((a, b) => 
    severityOrder[a.severity] - severityOrder[b.severity]
  )

  // 高优先级问题
  const highIssues = sortedIssues.filter(i => i.severity === 'high')
  if (highIssues.length > 0) {
    console.log(chalk.red('🔴 高优先级问题 (建议立即修复):'))
    console.log('')
    highIssues.forEach((issue, idx) => {
      printIssue(issue, idx + 1)
    })
    console.log('')
  }

  // 中优先级问题
  const mediumIssues = sortedIssues.filter(i => i.severity === 'medium')
  if (mediumIssues.length > 0) {
    console.log(chalk.yellow('🟡 中优先级问题 (建议尽快修复):'))
    console.log('')
    mediumIssues.forEach((issue, idx) => {
      printIssue(issue, idx + 1)
    })
    console.log('')
  }

  // 低优先级问题
  const lowIssues = sortedIssues.filter(i => i.severity === 'low')
  if (lowIssues.length > 0) {
    console.log(chalk.green('🟢 低优先级问题 (可以后续优化):'))
    console.log('')
    lowIssues.forEach((issue, idx) => {
      printIssue(issue, idx + 1)
    })
    console.log('')
  }

  // 优化建议总结
  console.log(chalk.cyan('💡 优化建议总结:'))
  console.log(chalk.gray('   1. 优先修复高优先级问题，这些对性能影响最大'))
  console.log(chalk.gray('   2. 使用中优先级问题提升用户体验'))
  console.log(chalk.gray('   3. 低优先级问题可以在后续迭代中逐步优化'))
  console.log(chalk.gray('   4. 所有建议仅供参考，请根据项目实际情况决定'))
  console.log('\n')
}

// 打印单个问题
function printIssue(issue: ScanIssue, index: number): void {
  const severityIcon = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  }[issue.severity]

  const typeLabel = {
    'performance': '⚡ 性能',
    'security': '🔒 安全',
    'seo': '🔍 SEO',
    'bundle': '📦 打包',
    'best-practice': '💡 实践'
  }[issue.type]

  console.log(chalk.white(`   ${index}. ${severityIcon} [${typeLabel}] ${issue.message}`))
  console.log(chalk.gray(`      📁 文件: ${issue.file}`))
  console.log(chalk.gray(`      📍 位置: 第 ${issue.line} 行`))
  console.log(chalk.green(`      💡 建议: ${issue.suggestion}`))
  
  if (issue.codeFrame) {
    console.log(chalk.gray('      代码片段:'))
    const lines = issue.codeFrame.split('\n')
    lines.forEach(line => {
      if (line.includes('>>>')) {
        console.log(chalk.yellow(`        ${line}`))
      } else {
        console.log(chalk.gray(`        ${line}`))
      }
    })
  }
  
  console.log('')
}

// 生成简化报告（用于开发环境快速提示）
export function generateQuickTips(result: ScanResult): void {
  const { issues } = result

  if (issues.length === 0) {
    console.log(chalk.green('\n✅ 代码质量优秀，未发现明显优化点'))
    return
  }

  const highCount = issues.filter(i => i.severity === 'high').length
  const mediumCount = issues.filter(i => i.severity === 'medium').length

  console.log(chalk.yellow(`\n🔍 发现 ${issues.length} 个可优化点 (${highCount} 高优先级, ${mediumCount} 中优先级)`))
  console.log(chalk.gray('   运行完整扫描查看详细报告和建议'))
  console.log(chalk.gray('   使用: optimizer.showOptimizationTips()'))
  console.log('')
}
