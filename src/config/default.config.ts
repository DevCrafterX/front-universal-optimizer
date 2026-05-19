export interface OptimizeConfig {
  env: 'development' | 'production'
  enableAllOpt: boolean
  routeLazyLoad: boolean
  imageWebpConvert: boolean
  resourcePreload: boolean
  domPrefetch: boolean
  treeShaking: boolean
  chunkSplit: boolean
  clearConsole: boolean
  brotliCompress: boolean
  autoDebounce: boolean
  autoThrottle: boolean
  autoClearEffect: boolean
  virtualListAutoReg: boolean
  frameSpecialOpt: boolean
  enableXSSDefend: boolean
  enableCSP: boolean
  safeRequestFilter: boolean
  safeStorage: boolean
  banDangerScript: boolean
}

export const defaultConfig: OptimizeConfig = {
  env: 'development',
  enableAllOpt: true,
  routeLazyLoad: true,
  imageWebpConvert: true,
  resourcePreload: true,
  domPrefetch: true,
  treeShaking: true,
  chunkSplit: true,
  clearConsole: false,
  brotliCompress: true,
  autoDebounce: true,
  autoThrottle: true,
  autoClearEffect: true,
  virtualListAutoReg: true,
  frameSpecialOpt: true,
  enableXSSDefend: true,
  enableCSP: false,
  safeRequestFilter: true,
  safeStorage: true,
  banDangerScript: false
}
