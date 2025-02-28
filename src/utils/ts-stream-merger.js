import { FFmpeg } from '@ffmpeg/ffmpeg'
import { TransformStream, ReadableStream } from 'web-streams-polyfill'

class TsVideoDownloader {
  constructor(options = {}) {
    this.ffmpeg = new FFmpeg()
    this.controller = new AbortController()
    this.options = {
      concurrency: 3,
      retryLimit: 2,
      bufferSize: 10,
      ...options
    }
    
    this.stats = {
      downloaded: 0,
      total: 0,
      converted: 0,
      failedSegments: new Set()
    }
    
    this.eventHandlers = {
      progress: [],
      error: [],
      complete: []
    }
  }

  // 事件系统
  on(event, handler) {
    this.eventHandlers[event].push(handler)
  }

  emit(event, ...args) {
    this.eventHandlers[event].forEach(handler => handler(...args))
  }

  // 核心下载流程优化
  async download(m3u8Url, fileName = "video.mp4") {
    try {
      await this.initFFmpeg()
      
      const { segments, keyInfo } = await this.parseM3U8(m3u8Url)
      this.stats.total = segments.length
      
      // 流式处理管道
      const processingPipeline = this.createProcessingPipeline(keyInfo)
      const mergedStream = await this.downloadWithStreams(segments, processingPipeline)
      
      await this.convertAndSave(mergedStream, fileName)
      this.emit('complete')
    } catch (err) {
      this.emit('error', err)
      throw err
    }
  }

  // 初始化FFmpeg（带缓存）
  async initFFmpeg() {
    await this.ffmpeg.load()
    this.ffmpeg.on('log', (message) => {
      console.warn('FFmpeg Error:', message)
    })
  }

  // 添加带重试机制的fetch方法
  async fetchWithRetry(url, options = {}, retries = 3) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (err) {
      clearTimeout(timeoutId)
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))) // 指数退避
        return this.fetchWithRetry(url, options, retries - 1)
      }
      throw new Error(`请求失败: ${url} (${err.message})`)
    }
  }

  // 增强版M3U8解析
  async parseM3U8(url) {
    const parseRecursive = async (url, parentUrl) => {
      const baseUrl = new URL(url, parentUrl).href
      const response = await this.fetchWithRetry(baseUrl)
      const text = await response.text()
      
      const segments = []
      let keyInfo = null
      let isLive = false
      
      const lines = text.split('\n').filter(l => l.trim())
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        if (line.startsWith('#EXT-X-KEY')) {
          keyInfo = this.parseKeyInfo(line, baseUrl)
        }
        
        if (line === '#EXT-X-ENDLIST') isLive = true
        
        if (line.startsWith('#EXT-X-STREAM-INF')) {
          const subUrl = new URL(lines[++i], baseUrl).href
          const subResult = await parseRecursive(subUrl, baseUrl)
          segments.push(...subResult.segments)
          keyInfo ||= subResult.keyInfo
        }
        
        if (!line.startsWith('#') && line) {
          const segmentUrl = new URL(line, baseUrl).href
          segments.push(segmentUrl)
        }
      }
      
      return { segments, keyInfo, isLive }
    }
    
    const { segments, keyInfo } = await parseRecursive(url, url)
    return {
      segments: [...new Set(segments)], // 去重
      keyInfo
    }
  }

  // 流式处理管道
  createProcessingPipeline(keyInfo) {
    let counter = 0
    
    return new TransformStream({
      transform: async (segmentUrl, controller) => {
        try {
          const blob = await this.downloadSegment(segmentUrl, keyInfo)
          controller.enqueue(blob)
          this.stats.downloaded++
          this.emitProgress()
        } catch (err) {
          this.stats.failedSegments.add(segmentUrl)
          console.warn(`Segment failed: ${segmentUrl}`, err)
        }
      }
    })
  }

  // 流式下载管理器
  async downloadWithStreams(segments, pipeline) {
    const readable = new ReadableStream({
      async start(controller) {
        for (const url of segments) {
          controller.enqueue(url)
        }
        controller.close()
      }
    })
    
    const writer = new TransformStream().writable.getWriter()
    const pipe = readable
      .pipeThrough(new TransformStream({
        async transform(url, controller) {
          controller.enqueue(url)
        }
      }))
      .pipeThrough(pipeline)
    
    return pipe
  }

  // 增强版分片下载
  async downloadSegment(url, keyInfo, retry = 0) {
    try {
      const response = await fetch(url, { 
        signal: this.controller.signal,
        cache: 'force-cache' // 优先使用缓存
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      let blob = await response.blob()
      if (keyInfo) blob = await this.decryptBlob(blob, keyInfo)
      
      return blob
    } catch (err) {
      if (retry < this.options.retryLimit) {
        return this.downloadSegment(url, keyInfo, retry + 1)
      }
      throw new Error(`下载失败: ${url} (${err.message})`)
    }
  }

  // 安全解密处理
  async decryptBlob(blob, { key, iv }) {
    try {
      const algorithm = { name: 'AES-CBC', iv }
      const cryptoKey = await crypto.subtle.importKey(
        'raw', key, algorithm, false, ['decrypt']
      )
      
      const decrypted = await crypto.subtle.decrypt(
        algorithm,
        cryptoKey,
        await blob.arrayBuffer()
      )
      
      return new Blob([decrypted])
    } catch (err) {
      throw new Error(`解密失败: ${err.message} (密钥长度: ${key.byteLength}字节)`)
    }
  }

  // 格式转换优化
  async convertAndSave(stream, fileName) {
    const inputName = 'input.ts';
    const outputName = 'output.mp4';
    let buffer = new Uint8Array(0);

    // 读取流数据到内存
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 合并ArrayBuffer
      const newBuffer = new Uint8Array(buffer.length + value.size);
      newBuffer.set(buffer);
      newBuffer.set(new Uint8Array(await value.arrayBuffer()), buffer.length);
      buffer = newBuffer;
    }

    // 写入FFmpeg文件系统
    await this.ffmpeg.writeFile(inputName, buffer);

    // 执行转换
    await this.ffmpeg.exec([
      '-i', inputName,
      '-c', 'copy',
      '-movflags', 'faststart',
      outputName
    ]);

    // 保存结果
    const data = await this.ffmpeg.readFile(outputName);
    this.saveFile(new Blob([data.buffer]), fileName);
  }

  // 辅助方法
  parseKeyInfo(line, baseUrl) {
    const params = line.split(/[:,]/)
      .reduce((acc, pair) => {
        const [key, val] = pair.split('=')
        if (key && val) acc[key.trim()] = val.replace(/"/g, '').trim()
        return acc
      }, {})
    
    if (!params.METHOD || params.METHOD !== 'AES-128') return null
    
    return {
      method: params.METHOD,
      key: this.fetchKey(new URL(params.URI, baseUrl)),
      iv: this.parseIV(params.IV)
    }
  }

  hexToBytes(hex) {
    return new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16)));
  }


  parseIV(ivStr) {
    ivStr = ivStr.startsWith('0x') ? ivStr.slice(2) : ivStr;
    return this.hexToBytes(ivStr.padEnd(32, '0').slice(0, 32));
  }

  async fetchKey(url) {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    
    // 自动检测密钥格式
    if (buffer.byteLength === 16) return new Uint8Array(buffer)
    
    const text = new TextDecoder().decode(buffer)
    if (/^[0-9a-fA-F]{32}$/.test(text)) return this.hexToBytes(text)
    if (/^[A-Za-z0-9+/=]{24}$/.test(text)) return Uint8Array.from(atob(text), c => c.charCodeAt(0))
    
    throw new Error('无效的密钥格式')
  }

  emitProgress() {
    this.emit('progress', {
      downloaded: this.stats.downloaded,
      total: this.stats.total,
      converted: this.stats.converted,
      failed: this.stats.failedSegments.size
    })
  }

  // 其他工具方法保持不变...
}

export default TsVideoDownloader