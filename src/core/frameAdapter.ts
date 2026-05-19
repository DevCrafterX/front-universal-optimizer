export enum FrameType {
  VUE2 = 'vue2',
  VUE3 = 'vue3',
  REACT = 'react',
  ANGULAR = 'angular',
  UNIAPP = 'uniapp',
  NATIVE = 'native'
}

export function detectFrame(): FrameType {
  if (typeof window === 'undefined') {return FrameType.NATIVE}
  const win = window as any
  if (win.__VUE__ && win.Vue?.version?.startsWith('3')) {return FrameType.VUE3}
  if (win.__VUE__ && win.Vue?.version?.startsWith('2')) {return FrameType.VUE2}
  if (win.__REACT__) {return FrameType.REACT}
  if (win.angular) {return FrameType.ANGULAR}
  if (win.uni) {return FrameType.UNIAPP}
  return FrameType.NATIVE
}

export function getFrameOptRule(frame: FrameType) {
  const map: Record<string, Record<string, boolean>> = {
    vue3: { autoShallowRef: true, autoVMemo: true, splitVueChunk: true },
    vue2: { autoLazyComponent: true, removeWatchRedundancy: true },
    react: { autoMemo: true, autoUseCallback: true, reactChunkSplit: true },
    uniapp: { miniImgLazy: true, miniSubPackage: true },
    native: { baseOpt: true }
  }
  return map[frame] || map.native
}
