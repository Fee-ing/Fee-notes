export const parseM3u8ToTsUrls = async (m3u8Url) => {
  // 递归解析嵌套播放列表
  const processPlaylist = async (url, baseUrl) => {
    const result = {
      tsList: [],
      keyInfo: null,
      error: null
    }

    const response = await fetch(url)
    if (!response.ok) {
      result.error = `HTTP ${response.status} - ${url}`
      return result
    }

    const text = await response.text()
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)

    let currentBaseUrl = new URL(url).origin
    let isLiveStream = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // 检测加密信息
      if (line.startsWith('#EXT-X-KEY')) {
        const match = line.match(/METHOD=([^,]+),URI="([^"]+)",IV=([^,\s]+)/i)
        if (match) {
          result.keyInfo = {
            method: match[1],
            uri: new URL(match[2], currentBaseUrl).href,
            iv: match[3].startsWith('0x')
              ? match[3].slice(2)
              : match[3]
          }
        }
      }

      // 处理嵌套播放列表
      if (line.startsWith('#EXT-X-STREAM-INF')) {
        const subUrl = lines[++i]
        const fullSubUrl = new URL(subUrl, url).href
        const subResult = await processPlaylist(fullSubUrl, url)
        result.tsList.push(...subResult.tsList)
        if (subResult.keyInfo) result.keyInfo = subResult.keyInfo
      }

      // 检测分片
      if (!line.startsWith('#') && line) {
        const isFullUrl = /^https?:\/\//.test(line)
        const tsUrl = isFullUrl
          ? line
          : new URL(line, currentBaseUrl).href

        // 兼容非.ts扩展名 (如数字分片、.m4s等)
        if (line.includes('/') || line.includes('.')) {
          result.tsList.push(tsUrl)
        }
      }

      // 检测直播流特性
      if (line === '#EXT-X-ENDLIST') isLiveStream = true
    }

    // 处理相对路径基准
    if (!isLiveStream && baseUrl) {
      currentBaseUrl = new URL(baseUrl).origin
    }

    return result
  }

  try {
    const { tsList, keyInfo } = await processPlaylist(m3u8Url, m3u8Url)

    // 二次验证去重
    const uniqueTsList = [...new Set(tsList)]
      .filter(url => {
        // 过滤无效路径
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      })

    return {
      tsList: uniqueTsList,
      keyInfo: keyInfo?.uri ? keyInfo : null,
      error: uniqueTsList.length === 0 ? '解析失败：未找到.ts片段，请检查M3U8格式' : null
    }
  } catch (error) {
    return { tsList: [], keyInfo: null, error }
  }
}

export async function decryptBlob(encryptedBlob, keyInfo) {
  try {
    if (!keyInfo?.uri) throw new Error("未提供密钥 URI")

    // 获取密钥
    const key = await getKeyData(keyInfo.uri)
    console.log("密钥长度:", key.length, "内容:", key.slice(0, 4))

    // 获取 IV
    const iv = parseIV(keyInfo.iv)
    console.log("IV 值:", iv)

    // 解密操作
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      await crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['decrypt']),
      await encryptedBlob.arrayBuffer()
    )

    return new Blob([decrypted], { type: 'video/mp2t' })
  } catch (err) {
    console.error("解密失败详情:")
    console.error("密钥 URI:", keyInfo?.uri)
    console.error("IV:", keyInfo?.iv)
    console.error("错误信息:", err)
    return null
  }
}

async function getKeyData(keyUri) {
  const res = await fetchKey(keyUri)
  const buffer = await res.arrayBuffer()

  // 如果密钥是十六进制字符串（如 "0123abcd..."）
  if (buffer.byteLength === 32 || buffer.byteLength === 64) {
    const text = new TextDecoder().decode(buffer)
    if (/^[0-9a-fA-F]+$/.test(text)) {
      return hexToBytes(text)
    }
  }

  // 如果密钥是 Base64
  try {
    const text = new TextDecoder().decode(buffer)
    const base64 = text.trim()
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  } catch { }

  // 直接返回二进制
  return new Uint8Array(buffer)
}

function parseIV(ivString) {
  // 处理不同IV格式
  let ivHex = ivString.toLowerCase().startsWith('0x')
    ? ivString.slice(2)
    : ivString

  // 补全16字节（32字符）
  ivHex = ivHex.padEnd(32, '0').slice(0, 32)

  return hexToBytes(ivHex)
}

async function fetchKey(keyUri) {
  // 使用 CORS 代理
  const proxyUrl = 'https://your-cors-proxy.com/'
  try {
    const res = await fetch(proxyUrl + encodeURIComponent(keyUri))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
  } catch (err) {
    // 直接请求（如果代理失败）
    return await fetch(keyUri)
  }
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}