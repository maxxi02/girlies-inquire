// URL Injection Protection
const JAVASCRIPT_PROTOCOL = /^javascript:/i
const DATA_PROTOCOL = /^data:/i

export function sanitizeUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (JAVASCRIPT_PROTOCOL.test(trimmed) || DATA_PROTOCOL.test(trimmed)) return ''
  return trimmed
}

// XSS Protection
export function sanitizeInput(input: string, maxLength = 1000): string {
  if (!input) return ''
  return input.trim().slice(0, maxLength)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

// Rate Limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const record = requestCounts.get(key)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) return false
  
  record.count++
  return true
}
