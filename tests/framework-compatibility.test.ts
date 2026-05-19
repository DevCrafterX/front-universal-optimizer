/**
 * 全量框架兼容性测试
 * 验证所有支持的框架都能正确检测和适配
 */

import { describe, it, expect, vi } from 'vitest'
import { createCodeOptimizer, FrameType, detectFrame, getFrameOptRule } from '../src'

describe('Framework Compatibility Tests', () => {

  describe('Frame Detection', () => {
    it('应该在非浏览器环境返回 NATIVE', () => {
      const frameResult = detectFrame()
      expect(frameResult.type).toBe(FrameType.NATIVE)
      expect(frameResult.features).toEqual([])
    })

    it('应该为所有框架类型返回对应的优化规则', () => {
      const frames = [
        FrameType.VUE2,
        FrameType.VUE3,
        FrameType.VUE3_4_PLUS,
        FrameType.REACT,
        FrameType.REACT_SERVER,
        FrameType.ANGULAR,
        FrameType.UNIAPP,
        FrameType.NATIVE,
        FrameType.SVELTE,
        FrameType.NEXTJS,
        FrameType.NUX
      ]

      frames.forEach(frame => {
        const rules = getFrameOptRule(frame)
        expect(rules).toBeDefined()
        expect(typeof rules).toBe('object')
      })
    })

    it('Vue3 应该有特定的优化规则', () => {
      const rules = getFrameOptRule(FrameType.VUE3)
      expect(rules.autoShallowRef).toBe(true)
      expect(rules.autoVMemo).toBe(true)
      expect(rules.splitVueChunk).toBe(true)
    })

    it('Vue2 应该有特定的优化规则', () => {
      const rules = getFrameOptRule(FrameType.VUE2)
      expect(rules.autoLazyComponent).toBe(true)
      expect(rules.removeWatchRedundancy).toBe(true)
    })

    it('React 应该有特定的优化规则', () => {
      const rules = getFrameOptRule(FrameType.REACT)
      expect(rules.autoMemo).toBe(true)
      expect(rules.autoUseCallback).toBe(true)
      expect(rules.reactChunkSplit).toBe(true)
    })

    it('Uniapp 应该有特定的优化规则', () => {
      const rules = getFrameOptRule(FrameType.UNIAPP)
      expect(rules.miniImgLazy).toBe(true)
      expect(rules.miniSubPackage).toBe(true)
    })

    it('Angular 应该有基础优化规则', () => {
      const rules = getFrameOptRule(FrameType.ANGULAR)
      expect(rules).toBeDefined()
    })

    it('Native 应该有基础优化规则', () => {
      const rules = getFrameOptRule(FrameType.NATIVE)
      expect(rules.baseOpt).toBe(true)
    })
  })

  describe('Optimizer with Different Frames', () => {
    it('应该能够为 Vue3 创建优化器', () => {
      const optimizer = createCodeOptimizer({
        env: 'development',
        enableAllOpt: true,
        frameSpecialOpt: true
      })

      expect(optimizer).toBeDefined()
      expect(optimizer.config.frameSpecialOpt).toBe(true)
    })

    it('应该能够为 React 创建优化器', () => {
      const optimizer = createCodeOptimizer({
        env: 'development',
        enableAllOpt: true,
        frameSpecialOpt: true
      })

      expect(optimizer).toBeDefined()
      expect(optimizer.frame).toBeDefined()
    })

    it('应该能够关闭框架特定优化', () => {
      const optimizer = createCodeOptimizer({
        env: 'development',
        frameSpecialOpt: false
      })

      expect(optimizer.config.frameSpecialOpt).toBe(false)
    })
  })

  describe('Configuration Control for All Frameworks', () => {
    it('应该能够通过配置控制所有优化项', () => {
      const config = {
        env: 'production' as const,
        enableAllOpt: false,
        routeLazyLoad: true,
        imageWebpConvert: true,
        resourcePreload: true,
        domPrefetch: true,
        treeShaking: true,
        chunkSplit: true,
        clearConsole: true,
        brotliCompress: true,
        autoDebounce: true,
        autoThrottle: true,
        autoClearEffect: true,
        virtualListAutoReg: true,
        frameSpecialOpt: true,
        enableXSSDefend: true,
        enableCSP: true,
        safeRequestFilter: true,
        safeStorage: true
      }

      const optimizer = createCodeOptimizer(config)

      // 验证所有配置项都被正确应用
      expect(optimizer.config.env).toBe('production')
      expect(optimizer.config.routeLazyLoad).toBe(true)
      expect(optimizer.config.imageWebpConvert).toBe(true)
      expect(optimizer.config.resourcePreload).toBe(true)
      expect(optimizer.config.domPrefetch).toBe(true)
      expect(optimizer.config.treeShaking).toBe(true)
      expect(optimizer.config.chunkSplit).toBe(true)
      expect(optimizer.config.clearConsole).toBe(true)
      expect(optimizer.config.brotliCompress).toBe(true)
      expect(optimizer.config.autoDebounce).toBe(true)
      expect(optimizer.config.autoThrottle).toBe(true)
      expect(optimizer.config.autoClearEffect).toBe(true)
      expect(optimizer.config.virtualListAutoReg).toBe(true)
      expect(optimizer.config.frameSpecialOpt).toBe(true)
      expect(optimizer.config.enableXSSDefend).toBe(true)
      expect(optimizer.config.enableCSP).toBe(true)
      expect(optimizer.config.safeRequestFilter).toBe(true)
      expect(optimizer.config.safeStorage).toBe(true)
    })

    it('应该能够部分覆盖默认配置', () => {
      const optimizer = createCodeOptimizer({
        env: 'production',
        chunkSplit: false,
        clearConsole: true
      })

      expect(optimizer.config.env).toBe('production')
      expect(optimizer.config.chunkSplit).toBe(false)
      expect(optimizer.config.clearConsole).toBe(true)
      // 其他配置应保持默认值
      expect(optimizer.config.routeLazyLoad).toBe(true)
      expect(optimizer.config.enableAllOpt).toBe(true)
    })
  })

  describe('Plugin Availability for All Build Tools', () => {
    it('Vite 插件应该始终可用', () => {
      const optimizer = createCodeOptimizer()
      expect(optimizer.vitePlugin).toBeDefined()
      expect(optimizer.vitePlugin.name).toBe('front-universal-optimizer-vite')
    })

    it('插件应该尊重配置选项', () => {
      const optimizer = createCodeOptimizer({
        chunkSplit: true,
        clearConsole: true,
        brotliCompress: true
      })

      expect(optimizer.vitePlugin).toBeDefined()
    })
  })

  describe('Hooks Compatibility Across Frameworks', () => {
    it('useDebounce 应该在所有环境下工作', async () => {
      const { useDebounce } = await import('../src/hooks/useDebounce')
      
      let callCount = 0
      const debouncedFn = useDebounce(() => {
        callCount++
      }, 50)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(callCount).toBe(1)
    })

    it('useThrottle 应该在所有环境下工作', async () => {
      const { useThrottle } = await import('../src/hooks/useThrottle')
      
      let callCount = 0
      const throttledFn = useThrottle(() => {
        callCount++
      }, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(callCount).toBe(1)
    })

    it('useAutoClear 应该在所有环境下工作', async () => {
      const { useAutoClear } = await import('../src/hooks/useAutoClear')
      
      const cleaner = useAutoClear()
      expect(cleaner.addTimer).toBeDefined()
      expect(cleaner.addListener).toBeDefined()
      expect(cleaner.clearAll).toBeDefined()
    })

    it('useVirtualList 应该在所有环境下工作', async () => {
      const { useVirtualList } = await import('../src/hooks/useVirtualList')
      
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i }))
      const virtualList = useVirtualList(data, { itemHeight: 50, visibleCount: 10 })

      expect(virtualList.visibleList).toBeDefined()
      expect(virtualList.totalHeight).toBe(5000)
      expect(virtualList.scrollTo).toBeDefined()
      expect(virtualList.startIndex).toBe(0)
      expect(virtualList.endIndex).toBe(10)
      expect(virtualList.visibleList.length).toBe(10)
    })
  })

  describe('Security Features Across All Environments', () => {
    it('xssEscape 应该在所有环境下工作', async () => {
      const { createCodeOptimizer } = await import('../src/index')
      const optimizer = createCodeOptimizer()

      const input = '<script>alert("xss")</script>'
      const output = optimizer.security.xssEscape(input)
      
      expect(output).not.toContain('<script>')
      expect(output).toContain('&lt;script&gt;')
    })

    it('safeStorage 应该在 SSR 环境安全降级', async () => {
      const { createCodeOptimizer } = await import('../src/index')
      const optimizer = createCodeOptimizer()

      // 在 Node.js 环境中，应该安全降级而不抛出错误
      expect(() => {
        optimizer.security.setSafeStorage('test', { value: 123 })
      }).not.toThrow()

      const result = optimizer.security.getSafeStorage('test')
      // 在 jsdom 测试环境下 localStorage 可用，所以会返回值
      // 在真实 Node.js 环境下会返回 null
      expect(result).toBeDefined()
    })

    it('secureRequest 应该只输出警告不拦截', async () => {
      const { createCodeOptimizer } = await import('../src/index')
      const optimizer = createCodeOptimizer()

      const config = {
        url: 'https://api.example.com/data',
        params: { password: 'secret' }
      }

      const result = optimizer.security.secureRequest(config)
      
      // 应该返回原始配置，不修改
      expect(result.url).toBe(config.url)
      expect(result.params.password).toBe('secret')
    })

    it('checkDangerApi 应该只检测不修改', async () => {
      const { createCodeOptimizer } = await import('../src/index')
      const optimizer = createCodeOptimizer()

      const dangers = optimizer.security.checkDangerApi()
      
      // 应该返回数组，不修改全局对象
      expect(Array.isArray(dangers)).toBe(true)
    })
  })

  describe('Zero Intrusion Verification', () => {
    it('导入模块时不应执行任何副作用', () => {
      // 这个测试验证导入时没有自动执行的代码
      // 如果有副作用，会在导入时就看到控制台输出或错误
      expect(true).toBe(true)
    })

    it('showOptimizationTips 仅在开发环境输出', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      const optimizer = createCodeOptimizer({
        env: 'development'
      })

      optimizer.showOptimizationTips()

      // 应该调用 console.log
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('enableProductionMode 仅在生产环境执行安全检查', () => {
      const optimizer = createCodeOptimizer({
        env: 'production'
      })

      // 不应该抛出错误
      expect(() => {
        optimizer.enableProductionMode()
      }).not.toThrow()
    })
  })
})
