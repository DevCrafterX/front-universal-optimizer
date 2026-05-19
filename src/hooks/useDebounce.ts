export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  cancel(): void
}

export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 300): DebouncedFunction<T> {
  let timer: any = null
  
  const debounced = function (...args: Parameters<T>) {
    if (timer) {clearTimeout(timer)}
    // SSR 兼容：在浏览器环境使用 window.setTimeout，否则使用全局 setTimeout
    const setTimeoutFn = typeof window !== 'undefined' ? window.setTimeout : setTimeout
    timer = setTimeoutFn(() => fn(...args), delay)
  } as DebouncedFunction<T>
  
  // 添加取消方法
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  
  return debounced
}
