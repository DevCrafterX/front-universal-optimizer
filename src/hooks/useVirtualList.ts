export interface VirtualListOptions {
  itemHeight: number
  visibleCount: number
}

export interface VirtualListResult {
  readonly visibleList: any[]
  readonly totalHeight: number
  readonly startIndex: number
  readonly endIndex: number
  scrollTo: (index: number) => void
}

export function useVirtualList(list: any[], options: VirtualListOptions): VirtualListResult {
  const { itemHeight, visibleCount } = options
  let startIndex = 0
  let endIndex = Math.min(visibleCount, list.length)
  
  const getVisibleList = () => {
    return list.slice(startIndex, endIndex)
  }
  
  const scrollTo = (index: number) => {
    startIndex = Math.max(0, Math.min(index, list.length - 1))
    endIndex = Math.min(startIndex + visibleCount, list.length)
  }
  
  // 使用 Object.defineProperty 创建响应式属性
  const result: any = {
    get visibleList() {
      return getVisibleList()
    },
    get totalHeight() {
      return list.length * itemHeight
    },
    get startIndex() {
      return startIndex
    },
    get endIndex() {
      return endIndex
    },
    scrollTo
  }
  
  return result as VirtualListResult
}
