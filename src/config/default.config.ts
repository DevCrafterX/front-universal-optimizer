export interface ChunkSplitConfig {
  enable: boolean
  strategy?: 'default' | 'fine-grained' | 'custom'
  customRules?: Record<string, (id: string) => boolean>
  maxInitialSize?: number
  maxAsyncSize?: number
}

export interface OptimizeConfig {
  env: 'development' | 'production'
  enableAllOpt: boolean
  routeLazyLoad: boolean
  imageWebpConvert: boolean
  resourcePreload: boolean
  domPrefetch: boolean
  treeShaking: boolean
  chunkSplit: boolean | ChunkSplitConfig
  clearConsole: boolean
  consoleRemovalStrategy?: 'regex' | 'babel'
  brotliCompress: boolean
  autoDebounce: boolean
  autoThrottle: boolean
  autoClearEffect: boolean
  virtualListAutoReg: boolean
  frameSpecialOpt: boolean
  enableXSSDefend: boolean
  enableCSP: boolean
  cspPolicy?: string
  safeRequestFilter: boolean
  safeStorage: boolean
}

export const defaultConfig: OptimizeConfig = {
  env: 'development',
  enableAllOpt: true,
  routeLazyLoad: true,
  imageWebpConvert: true,
  resourcePreload: true,
  domPrefetch: true,
  treeShaking: true,
  chunkSplit: {
    enable: true,
    strategy: 'fine-grained',
    maxInitialSize: 244 * 1024, // 244kb
    maxAsyncSize: 244 * 1024
  },
  clearConsole: false,
  consoleRemovalStrategy: 'babel',
  brotliCompress: true,
  autoDebounce: true,
  autoThrottle: true,
  autoClearEffect: true,
  virtualListAutoReg: true,
  frameSpecialOpt: true,
  enableXSSDefend: true,
  enableCSP: false,
  cspPolicy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'",
  safeRequestFilter: true,
  safeStorage: true
}
