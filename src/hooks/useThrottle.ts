export interface ThrottledFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  cancel(): void
}

export function useThrottle<T extends (...args: any[]) => any>(fn: T, interval = 300): ThrottledFunction<T> {
  let last = 0
  let timer: any = null
  
  const throttled = function (...args: Parameters<T>) {
    const now = Date.now()
    const remaining = interval - (now - last)
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      last = now
      fn(...args)
    } else if (!timer) {
      // 确保在间隔结束后执行最后一次调用
      // SSR 兼容：在浏览器环境使用 window.setTimeout，否则使用全局 setTimeout
      const setTimeoutFn = typeof window !== 'undefined' ? window.setTimeout : setTimeout
      timer = setTimeoutFn(() => {
        last = Date.now()
        timer = null
        fn(...args)
      }, remaining)
    }
  } as ThrottledFunction<T>
  
  // 添加取消方法
  throttled.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  
  return throttled
}
