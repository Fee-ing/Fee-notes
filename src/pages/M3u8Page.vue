<template>
  <div class="page-wrapper page-m3u8">
    <el-input
      v-model="url"
      style="max-width: 600px"
      placeholder="请输入.m3u8格式的链接"
      class="input-with-select"
    >
      <template #prepend>
        <el-select v-model="model" placeholder="请选择" style="width: 115px">
          <el-option label="原格式" value="1" />
          <el-option label="MP4" value="2" />
        </el-select>
      </template>
      <template #append>
        <el-button type="primary" @click="handleStart" :loading="downloadLoading">下载</el-button>
      </template>
    </el-input>
    <el-progress
      :text-inside="true"
      :stroke-width="20"
      :percentage="percentage"
      style="max-width: 600px;margin-top: 50px;"
      v-if="downloadIndex > 0"
    />
    <el-timeline style="max-width: 600px;margin-top: 50px;">
      <el-timeline-item
        v-for="(item, index) in log"
        :key="index"
        :timestamp="item.timestamp"
        :hollow="index === 0"
        :type="index === 0 ? 'primary' : ''"
        :color="item.color"
      >
        {{ item.content }}
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import AESDecryptor from '@/utils/aes-decryptor'
import muxjs from '@/utils/mux-mp4'

const url = ref('')
const model = ref('1')
const downloadLoading = ref(false)
const downloadIndex = ref(0)
const startSegment = ref(1)
const endSegment = ref(1)
const targetSegment = ref(0)
const tsUrlList = ref([])
const finishList = ref([])
const mediaFileList = ref([])
const finishNum = ref(0)
const errorNum = ref(0)
const durationSecond = ref(0)
// AES 视频解密配置
const aesConf = ref({
  method: '', // 加密算法
  uri: '', // key 所在文件路径
  iv: '', // 偏移值
  key: '', // 秘钥
  decryptor: null, // 解码器对象
  stringToBuffer: function (str) {
    return new TextEncoder().encode(str)
  },
})
const log = ref([])

const percentage = computed(() => {
  if (endSegment.value - startSegment.value === 0) return 0 
  return parseInt((downloadIndex.value - 1) / (endSegment.value - startSegment.value) * 100)
})

const ajax = (options = {}) => {
  return new Promise(resolve => {
    let xhr = new XMLHttpRequest()
    if (options.type === 'file') {
      xhr.responseType = 'arraybuffer'
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        let status = xhr.status
        if (status >= 200 && status < 300) {
          resolve(xhr.response)
        } else {
          resolve(null)
        }
      }
    }

    xhr.open('GET', options.url, true)
    xhr.send(null)
  })
}

// 合成URL
const applyURL = (targetURL, baseURL) => {
  baseURL = baseURL || location.href
  if (targetURL.indexOf('http') === 0) {
    // 当前页面使用 https 协议时，强制使 ts 资源也使用 https 协议获取
    if(location.href.indexOf('https') === 0){
      return targetURL.replace('http://','https://')
    }
    return targetURL
  } else if (targetURL[0] === '/') {
    let domain = baseURL.split('/')
    return domain[0] + '//' + domain[2] + targetURL
  } else {
    let domain = baseURL.split('/')
    domain.pop()
    return domain.join('/') + '/' + targetURL
  }
}

// ts 片段的 AES 解码
const aesDecrypt = (data, index) => {
  const iv = aesConf.value.iv || new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, index])
  return aesConf.value.decryptor.decrypt(data, 0, iv.buffer || iv, true)
}

const conversionMp4 = (data, index) => {
  return new Promise(resolve => {
    if (model.value === '1') {
      resolve(data)
    } else if (model.value === '2') {
      const transmuxer = new muxjs.Transmuxer({
        keepOriginalTimestamps: true,
        duration: parseInt(durationSecond.value),
      })
      transmuxer.on('data', segment => {
        if (index === startSegment.value - 1) {
          let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength)
          data.set(segment.initSegment, 0)
          data.set(segment.data, segment.initSegment.byteLength)
          resolve(data.buffer)
        } else {
          resolve(segment.data)
        }
      })
      transmuxer.push(new Uint8Array(data))
      transmuxer.flush()
    }
  })
}

const downloadFile = (fileDataList, fileName) => {
  let fileBlob = null
  let a = document.createElement('a')
  if (model.value === '2') {
    fileBlob = new Blob(fileDataList, { type: 'video/mp4' }) // 创建一个Blob对象，并设置文件的 MIME 类型
    a.download = fileName + '.mp4'
  } else {
    fileBlob = new Blob(fileDataList, { type: 'video/MP2T' }) // 创建一个Blob对象，并设置文件的 MIME 类型
    a.download = fileName + '.ts'
  }
  a.href = URL.createObjectURL(fileBlob)
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  downloadLoading.value = false
}

// 下载分片
const downloadTS = () => {
  const download = async () => {
    const index = downloadIndex.value
    if (index >= endSegment.value) return
    downloadIndex.value++
    console.log(downloadIndex.value)
    // log.value.unshift({
    //   content: `下载第${downloadIndex.value}个视频片段`,
    //   timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
    // })
    if (finishList.value[index].status === '') {
      finishList.value[index].status = 'downloading'
      const file = await ajax({ url: tsUrlList.value[index], type: 'file' })
      if (file) {
        const data = aesConf.value.uri ? aesDecrypt(file, index) : file
        // 若下载mp4须另外处理
        const afterData = await conversionMp4(data, index)
        mediaFileList.value[index - startSegment.value + 1] = afterData // 判断文件是否需要解密
        finishList.value[index].status = 'finish'
        finishNum.value++

        if (finishNum.value === targetSegment.value) {
          const title = new URL(url.value).searchParams.get('title') || dayjs(new Date()).format('YYYY_MM_DD_hh_mm_ss')
          downloadFile(mediaFileList.value, title)
          log.value.unshift({
            content: '全部下载完成',
            timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
          })
          return
        }
        if (downloadIndex.value < endSegment.value) {
          download()
        }
      } else {
        errorNum.value++
        finishList.value[index].status = 'error'
        if (downloadIndex.value < endSegment.value) {
          download()
        }
      }
    } else if (downloadIndex.value < endSegment.value) {
      download()
    }
  }
  for (let i = 0; i < Math.min(6, targetSegment.value - finishNum.value); i++) {
    download()
  }
}

const getM3U8 = async (link) => {
  log.value.unshift({
    content: '开始提取视频片段地址',
    timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
  })
  const m3u8Str = await ajax({ url: link })
  if (!m3u8Str) {
    ElNotification({
      title: '提示',
      message: '提取视频片段地址失败',
      type: 'error',
    })
    log.value.unshift({
      content: '提取视频片段地址失败',
      timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS'),
      color: '#F56C6C'
    })
    return
  }
  downloadLoading.value = true
  tsUrlList.value = []
  finishList.value = []
  m3u8Str.split('\n').forEach((item) => {
    if (/^[^#]/.test(item)) {
      tsUrlList.value.push(applyURL(item, link))
      finishList.value.push({ title: item, status: '' })
    }
  })
  log.value.unshift({
    content: '提取视频片段地址成功',
    timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
  })
  startSegment.value = 1
  endSegment.value = tsUrlList.value.length
  targetSegment.value = endSegment.value - startSegment.value + 1
  downloadIndex.value = startSegment.value - 1
  finishNum.value = 0
  errorNum.value = 0

  // 获取需要下载的 MP4 视频长度
  if (model.value === '2') {
    log.value.unshift({
      content: '获取需要下载的 MP4 视频长度',
      timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
    })
    let infoIndex = 0
    m3u8Str.split('\n').forEach(item => {
      if (item.toUpperCase().indexOf('#EXTINF:') > -1) {
        // 计算视频总时长，设置 mp4 信息时使用
        infoIndex++
        if (startSegment.value <= infoIndex && infoIndex <= endSegment.value) {
          durationSecond.value += parseFloat(item.split('#EXTINF:')[1])
        }
      }
    })
  }

  log.value.unshift({
    content: '检测视频 AES 加密',
    timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
  })
  // 检测视频 AES 加密
  if (m3u8Str.indexOf('#EXT-X-KEY') > -1) {
    aesConf.value.method = (m3u8Str.match(/(.*METHOD=([^,\s]+))/) || ['', '', ''])[2]
    aesConf.value.uri = (m3u8Str.match(/(.*URI="([^"]+))"/) || ['', '', ''])[2]
    aesConf.value.iv = (m3u8Str.match(/(.*IV=([^,\s]+))/) || ['', '', ''])[2]
    aesConf.value.iv = aesConf.value.iv ? aesConf.value.stringToBuffer(aesConf.value.iv) : ''

    log.value.unshift({
      content: '获取 AES 配置',
      timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
    })
    // 获取AES配置
    aesConf.value.uri = applyURL(aesConf.value.uri, link)
    const key = await ajax({ url: aesConf.value.uri, type: 'file' })
    if (!key) {
      ElNotification({
        title: '提示',
        message: '解密失败',
        type: 'error',
      })
      downloadLoading.value = false
      log.value.unshift({
        content: '解密失败',
        timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS'),
        color: '#F56C6C'
      })
      return
    }
    aesConf.value.key = key
    aesConf.value.decryptor = new AESDecryptor()
    aesConf.value.decryptor.constructor()
    aesConf.value.decryptor.expandKey(aesConf.value.key)
    downloadTS()
  } else if (tsUrlList.value.length > 0) {
    // 如果视频没加密，则直接下载片段，否则先下载秘钥
    log.value.unshift({
      content: '无加密，直接开始下载',
      timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
    })
    downloadTS()
  } else {
    ElNotification({
      title: '提示',
      message: '资源为空，请查看链接是否有效',
      type: 'error',
    })
    downloadLoading.value = false
    log.value.unshift({
      content: '资源为空，请查看链接是否有效',
      timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS'),
      color: '#F56C6C'
    })
  }
}

const handleStart = () => {
  if (url.value.toLocaleLowerCase().indexOf('.m3u8') < 0) {
    ElNotification({
      title: '提示',
      message: '请输入正确的链接',
      type: 'error',
    })
    return
  }
  log.value = []
  log.value.unshift({
    content: '开始下载',
    timestamp: dayjs(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS')
  })
  getM3U8(url.value)
}

</script>

<style lang="less" scoped>
.page-m3u8 {
  
}
</style>