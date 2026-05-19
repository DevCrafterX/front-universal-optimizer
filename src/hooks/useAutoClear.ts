export function useAutoClear() {
  let timers: Array<number | ReturnType<typeof setTimeout>> = []
  let listeners: Array<() => void> = []

  const addTimer = (t: number | ReturnType<typeof setTimeout>) => timers.push(t)
  const addListener = (cb: () => void) => listeners.push(cb)

  const clearTimer = () => {
    timers.forEach(t => clearTimeout(t))
    timers = []
  }

  const clearListener = () => {
    listeners.forEach(cb => cb())
    listeners = []
  }

  // 添加清理所有资源的统一方法
  const clearAll = () => {
    clearTimer()
    clearListener()
  }

  return { addTimer, addListener, clearTimer, clearListener, clearAll }
}
