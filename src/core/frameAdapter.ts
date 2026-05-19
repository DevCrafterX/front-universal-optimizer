export enum FrameType {
  VUE2 = 'vue2',
  VUE3 = 'vue3',
  VUE3_4_PLUS = 'vue3.4+', // Vue 3.4+ 新特性支持
  REACT = 'react',
  REACT_SERVER = 'react-server', // React Server Components
  ANGULAR = 'angular',
  UNIAPP = 'uniapp',
  NATIVE = 'native',
  SVELTE = 'svelte', // 新增 Svelte 支持
  NEXTJS = 'nextjs', // 新增 Next.js 支持
  NUX = 'nuxt' // 新增 Nuxt 支持
}

export interface FrameDetectionResult {
  type: FrameType
  version?: string
  features: string[]
}

export function detectFrame(): FrameDetectionResult {
  if (typeof window === 'undefined') {
    return { type: FrameType.NATIVE, features: [] }
  }
  
  const win = window as any
  const features: string[] = []
  let version: string | undefined
  
  // Vue 检测（增强版）
  if (win.__VUE__) {
    const vueVersion = win.Vue?.version || '3'
    version = vueVersion
    
    if (vueVersion.startsWith('3')) {
      // Vue 3.4+ 特性检测
      const isVue34Plus = compareVersion(vueVersion, '3.4.0') >= 0
      if (isVue34Plus) {
        features.push('useTemplateRef', 'defineModel', 'useId')
        return { type: FrameType.VUE3_4_PLUS, version, features }
      }
      features.push('Composition API', 'Teleport', 'Suspense')
      return { type: FrameType.VUE3, version, features }
    }
    
    if (vueVersion.startsWith('2')) {
      features.push('Options API', 'Mixin')
      return { type: FrameType.VUE2, version, features }
    }
  }
  
  // React 检测（增强版）
  if (win.__REACT__ || win.React) {
    const reactVersion = win.React?.version || '18'
    version = reactVersion
    
    // React 18+ 支持 Server Components
    const isReact18Plus = compareVersion(reactVersion, '18.0.0') >= 0
    if (isReact18Plus) {
      features.push('Concurrent Mode', 'Suspense', 'useTransition')
      
      // 检测是否为 Server Components 环境
      if (win.__NEXT_DATA__ || win.$RefreshReg$) {
        features.push('Server Components', 'Server Actions')
        return { type: FrameType.REACT_SERVER, version, features }
      }
      
      return { type: FrameType.REACT, version, features }
    }
    
    features.push('Hooks', 'Context API')
    return { type: FrameType.REACT, version, features }
  }
  
  // Angular 检测
  if (win.angular || win.ng) {
    version = win.ng?.core?.VERSION?.full
    features.push('Dependency Injection', 'RxJS')
    return { type: FrameType.ANGULAR, version, features }
  }
  
  // Uniapp 检测
  if (win.uni) {
    features.push('Cross-platform', 'Mini Program')
    return { type: FrameType.UNIAPP, features }
  }
  
  // Next.js 检测
  if (win.__NEXT_DATA__) {
    version = win.__NEXT_DATA__.runtimeConfig?.nextVersion
    features.push('SSR', 'API Routes', 'Image Optimization')
    return { type: FrameType.NEXTJS, version, features }
  }
  
  // Nuxt 检测
  if (win.__NUXT__) {
    version = win.__NUXT__.config?.appVersion
    features.push('SSR', 'Auto Imports', 'Modules')
    return { type: FrameType.NUX, version, features }
  }
  
  // Svelte 检测
  if (win.__svelte || (win.document && win.document.querySelector('[data-sveltekit]'))) {
    features.push('Compile-time', 'Reactive Declarations')
    return { type: FrameType.SVELTE, features }
  }
  
  return { type: FrameType.NATIVE, features }
}

// 版本号比较工具函数
function compareVersion(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const n1 = parts1[i] || 0
    const n2 = parts2[i] || 0
    
    if (n1 > n2) {
      return 1
    }
    if (n1 < n2) {
      return -1
    }
  }
  
  return 0
}

export function getFrameOptRule(frame: FrameType | FrameDetectionResult) {
  const frameType = typeof frame === 'object' ? frame.type : frame
  
  const map: Record<string, Record<string, boolean>> = {
    'vue3.4+': {
      autoShallowRef: true,
      autoVMemo: true,
      splitVueChunk: true,
      useDefineModel: true, // Vue 3.4+ 新特性
      useUseId: true // Vue 3.4+ useId hook
    },
    vue3: {
      autoShallowRef: true,
      autoVMemo: true,
      splitVueChunk: true
    },
    vue2: {
      autoLazyComponent: true,
      removeWatchRedundancy: true
    },
    'react-server': {
      autoMemo: true,
      autoUseCallback: true,
      reactChunkSplit: true,
      serverComponentOpt: true, // RSC 优化
      streamingSSR: true // 流式 SSR
    },
    react: {
      autoMemo: true,
      autoUseCallback: true,
      reactChunkSplit: true
    },
    nextjs: {
      autoMemo: true,
      imageOptimization: true,
      isrSupport: true // Incremental Static Regeneration
    },
    nuxt: {
      autoNuxtOptimize: true,
      ssrOptimize: true,
      autoImportOpt: true
    },
    svelte: {
      compileTimeOpt: true,
      storeOptimize: true
    },
    uniapp: {
      miniImgLazy: true,
      miniSubPackage: true
    },
    native: {
      baseOpt: true
    }
  }
  
  return map[frameType] || map.native
}

// 新增：获取框架特定的优化建议
export function getFrameSpecificRecommendations(frame: FrameDetectionResult): string[] {
  const recommendations: string[] = []
  
  switch (frame.type) {
    case FrameType.VUE3_4_PLUS:
      recommendations.push('Vue 3.4+: 使用 defineModel() 简化双向绑定')
      recommendations.push('Vue 3.4+: 使用 useId() 生成唯一 ID')
      break
    case FrameType.REACT_SERVER:
      recommendations.push('React Server: 利用 Server Components 减少客户端 JS')
      recommendations.push('React Server: 使用 Server Actions 处理表单提交')
      break
    case FrameType.NEXTJS:
      recommendations.push('Next.js: 使用 next/image 自动优化图片')
      recommendations.push('Next.js: 利用 ISR 实现增量静态再生')
      break
    case FrameType.NUX:
      recommendations.push('Nuxt: 使用 useFetch/useAsyncData 优化数据获取')
      recommendations.push('Nuxt: 利用 Nuxt Modules 生态扩展功能')
      break
    case FrameType.SVELTE:
      recommendations.push('Svelte: 利用编译时优化减少运行时开销')
      recommendations.push('Svelte: 使用 Stores 管理全局状态')
      break
  }
  
  return recommendations
}
