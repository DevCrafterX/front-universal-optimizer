import { FrameType } from './frameAdapter'

export const SecurityGuard = {
  // 增强版 XSS 转义（支持更多场景）
  xssEscape(str: string, strict: boolean = false): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#96;',
      '=': '&#x3D;'
    }
    
    let result = str.replace(/[&<>"'/`=]/g, s => map[s] || s)
    
    // 严格模式下额外检测 SVG/数学公式等高级 XSS 向量
    if (strict) {
      const dangerousPatterns = [
        /javascript\s*:/gi,
        /vbscript\s*:/gi,
        /data\s*:/gi,
        /expression\s*\(/gi,
        /url\s*\(/gi
      ]
      
      dangerousPatterns.forEach(pattern => {
        if (pattern.test(result)) {
          console.warn('[Security Warning] 检测到潜在 XSS 攻击向量')
          result = result.replace(pattern, '[BLOCKED]')
        }
      })
    }
    
    return result
  },

  // 框架特定的安全警告
  frameworkSecurityWarn(frame: FrameType) {
    const warnings: string[] = []
    
    switch (frame) {
      case FrameType.REACT:
        warnings.push('React: 避免使用 dangerouslySetInnerHTML，除非已对内容进行 xssEscape 处理')
        warnings.push('React: 注意 useEffect 中直接操作 DOM 可能引入 XSS 风险')
        break
      case FrameType.VUE2:
      case FrameType.VUE3:
        warnings.push('Vue: 避免使用 v-html 指令渲染未转义的用户输入')
        warnings.push('Vue: 动态组件 <component :is="..."> 需验证来源安全性')
        break
      case FrameType.ANGULAR:
        warnings.push('Angular: 使用 DomSanitizer 清理不安全的内容')
        warnings.push('Angular: 避免绕过内置安全机制 (bypassSecurityTrustHtml)')
        break
    }
    
    if (warnings.length > 0) {
      console.warn('[Framework Security Tips]\n' + warnings.map(w => `  • ${w}`).join('\n'))
    }
    
    return warnings
  },

  secureRequest(reqConfig: any) {
    const sensitive = ['password', 'idCard', 'phone', 'token', 'secret', 'authorization']
    sensitive.forEach(k => {
      if (reqConfig.params && reqConfig.params[k]) {
        console.warn(`[Security Warning] 检测到敏感字段 "${k}"，建议在传输前加密`)
      }
      if (reqConfig.data && reqConfig.data[k]) {
        console.warn(`[Security Warning] 检测到敏感字段 "${k}"，建议在传输前加密`)
      }
    })
    
    // 增强域名白名单检测
    const allowReg = /^(https?:\/\/(localhost|127\.0\.0\.1|api\.|your-domain\.com))/
    if (!allowReg.test(reqConfig.url)) {
      console.warn(`[Security Warning] 请求域名 "${reqConfig.url}" 不在白名单中，请确认安全性`)
    }
    
    // 检测 HTTP 明文传输
    if (reqConfig.url.startsWith('http://') && !reqConfig.url.includes('localhost')) {
      console.warn('[Security Warning] 使用 HTTP 明文传输，建议升级为 HTTPS')
    }
    
    return reqConfig
  },

  setSafeStorage(key: string, val: unknown, encrypt: boolean = true) {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('[Security Warning] localStorage 不可用，跳过安全存储')
      return
    }
    
    try {
      const str = JSON.stringify(val)
      let encode = str
      
      if (encrypt) {
        // Base64 编码（轻量级混淆，非真正加密）
        encode = btoa(unescape(encodeURIComponent(str)))
      }
      
      localStorage.setItem(`safe_${key}`, encode)
    } catch (e) {
      console.error('[Security Error] 安全存储失败:', e)
    }
  },

  getSafeStorage<T>(key: string, decrypt: boolean = true): T | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    
    try {
      const res = localStorage.getItem(`safe_${key}`)
      if (!res) {return null}
      
      let decoded = res
      if (decrypt) {
        decoded = decodeURIComponent(escape(atob(res)))
      }
      
      return JSON.parse(decoded)
    } catch (e) {
      console.error('[Security Error] 安全读取失败:', e)
      return null
    }
  },

  // 增强版危险 API 检测
  checkDangerApi(strict: boolean = false) {
    if (typeof window === 'undefined') {return []}
    
    const dangers: string[] = []
    
    // 基础检测
    if (typeof window.eval !== 'undefined' && window.eval.toString().includes('native')) {
      dangers.push('eval 未被禁用')
    }
    if (typeof document.write !== 'undefined') {
      dangers.push('document.write 未被禁用')
    }
    
    // 严格模式额外检测
    if (strict) {
      if ('execScript' in window) {
        dangers.push('execScript 未被禁用 (IE 遗留 API)')
      }
      if (typeof Function !== 'undefined' && Function.prototype.constructor === Function) {
        dangers.push('Function 构造函数可用')
      }
      if (typeof window.setTimeout === 'function' && window.setTimeout.toString().includes('string')) {
        dangers.push('setTimeout 可执行字符串代码')
      }
    }
    
    if (dangers.length > 0) {
      console.warn('[Security Warning] 检测到潜在危险 API:', dangers.join(', '))
    }
    
    return dangers
  },
  
  // 新增：CSP 策略建议生成器
  generateCSPRecommendations(frame: FrameType): string {
    const basePolicy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
    
    const frameSpecific = {
      [FrameType.REACT]: " script-src 'self' 'unsafe-eval'", // React DevTools 需要
      [FrameType.VUE3]: " script-src 'self' 'unsafe-eval'", // Vue DevTools 需要
      [FrameType.UNIAPP]: " script-src 'self' 'unsafe-eval'", // Uniapp 需要
    }
    
    return basePolicy + (frameSpecific[frame] || '')
  }
}
