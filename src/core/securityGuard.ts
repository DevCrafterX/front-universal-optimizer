export const SecurityGuard = {
  xssEscape(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }
    return str.replace(/[&<>"']/g, s => map[s] || s)
  },

  secureRequest(reqConfig: any) {
    const sensitive = ['password', 'idCard', 'phone', 'token']
    sensitive.forEach(k => {
      if (reqConfig.params && reqConfig.params[k]) {
        console.warn(`[Security Warning] 检测到敏感字段 "${k}"，建议在传输前加密`)
      }
      if (reqConfig.data && reqConfig.data[k]) {
        console.warn(`[Security Warning] 检测到敏感字段 "${k}"，建议在传输前加密`)
      }
    })
    const allowReg = /^(https?:\/\/(localhost|127\.0\.0\.1|api\.))/
    if (!allowReg.test(reqConfig.url)) {
      console.warn(`[Security Warning] 请求域名 "${reqConfig.url}" 不在白名单中，请确认安全性`)
    }
    return reqConfig
  },

  setSafeStorage(key: string, val: unknown) {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('[Security Warning] localStorage 不可用，跳过安全存储')
      return
    }
    try {
      const str = JSON.stringify(val)
      const encode = btoa(unescape(encodeURIComponent(str)))
      localStorage.setItem(`safe_${key}`, encode)
    } catch (e) {
      console.error('[Security Error] 安全存储失败:', e)
    }
  },

  getSafeStorage<T>(key: string): T | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    try {
      const res = localStorage.getItem(`safe_${key}`)
      if (!res) {return null}
      return JSON.parse(decodeURIComponent(escape(atob(res))))
    } catch (e) {
      console.error('[Security Error] 安全读取失败:', e)
      return null
    }
  },

  checkDangerApi() {
    if (typeof window === 'undefined') {return []}
    
    const dangers: string[] = []
    if (typeof window.eval !== 'undefined' && window.eval.toString().includes('native')) {
      dangers.push('eval 未被禁用')
    }
    if (typeof document.write !== 'undefined') {
      dangers.push('document.write 未被禁用')
    }
    
    if (dangers.length > 0) {
      console.warn('[Security Warning] 检测到潜在危险 API:', dangers.join(', '))
    }
    
    return dangers
  }
}
