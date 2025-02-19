<template>
  <div class="page-wrapper page-m3u8 flex-h">
    <div class="m3u8-content">
      <el-input
        v-model="url"
        clearable
        style="max-width: 600px"
        placeholder="请输入.m3u8格式的链接"
        class="input-with-select"
        @clear="handleClear"
      >
        <template #prepend>
          <el-button type="primary">{{ downloadLoading ? `进度 ${downloadProgress}%` : '下载链接' }}</el-button>
        </template>
        <template #append>
          <el-button type="primary" @click="handleStart">{{ downloadLoading ? '取消' : '开始' }}</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElNotification } from 'element-plus'

const url = ref('')
const downloadLoading = ref(false)
const downloadProgress = ref(0)
const documentTitle = document.title

watch(downloadLoading, (newValue) => {
  if (newValue) {
    document.title = `${documentTitle} - 进度${downloadProgress.value}%`
  } else {
    document.title = documentTitle
  }
})

const handleStart = () => {
  if (downloadLoading.value) {
    downloadLoading.value = false
    downloadProgress.value = 0
    return
  }
  downloadProgress.value = 0
  downloadLoading.value = true
  const m3u8Url = url.value
  const video = document.createElement('video')
  const hls = new Hls()

  // 加载 .m3u8 文件
  hls.loadSource(m3u8Url)
  hls.attachMedia(video)

  // 监听错误事件
  hls.on(Hls.Events.ERROR, (event, data) => {
    console.error('HLS Error:', data)
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('网络错误，尝试恢复中...')
          hls.startLoad()
          break
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('视频错误，尝试恢复中...')
          hls.recoverMediaError()
          break
        default:
          console.error('下载视频失败')
          hls.destroy()
          downloadLoading.value = false
          ElNotification.error({
            title: 'Error',
            message: '下载视频失败'
          })
          break
      }
    }
  })

  let totalFragments = 0
  let loadedFragments = 0

  // 监听 LEVEL_LOADED 事件以获取总片段数
  hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
    if (data.details && data.details.fragments) {
      totalFragments = data.details.fragments.length
      console.log(`总片段数: ${totalFragments}`)
    }
  });

  // 监听 MANIFEST_PARSED 事件，表示视频可以播放
  hls.on(Hls.Events.MANIFEST_PARSED, async () => {
    console.log('解析成功，开始播放...')

    try {
      // 播放视频
      await video.play().catch(error => {
        console.error('播放视频失败:', error)
      })
      console.log('视频播放中...')

      // 创建 MediaRecorder
      const stream = video.captureStream()
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/mp4', // 使用 video/mp4 以提高质量
        videoBitsPerSecond: 5000000, // 设置比特率为 5 Mbps
        audioBitsPerSecond: 192000   // 设置音频比特率为 192 kbps
      })

      const chunks = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // 合并录制的数据
        const blob = new Blob(chunks, { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)

        // 提供下载链接
        const a = document.createElement('a')
        a.href = url
        a.download = 'video.mp4'
        a.click()
        URL.revokeObjectURL(url)

        downloadLoading.value = false
        downloadProgress.value = 100
      }

      // 开始录制
      mediaRecorder.start()
      console.log('开始录制')

      // 更新进度
      const updateProgress = (loadProgress, currentTime, duration) => {
        let recordProgress = 0
        if (!isNaN(duration) && duration !== Infinity) {
          recordProgress = (currentTime / duration) * 100
        }
        const overallProgress = (loadProgress + recordProgress) / 2; // 综合加载和录制进度
        downloadProgress.value = overallProgress.toFixed(2)
        if (downloadLoading.value) {
          document.title = `${documentTitle} - 进度${downloadProgress.value}%`
        }
      }

      // 监听加载和录制进度
      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        loadedFragments++
        const loadProgress = (loadedFragments / totalFragments) * 100
        updateProgress(loadProgress, video.currentTime, video.duration)
      })

      // 监听视频播放时间更新
      video.addEventListener('timeupdate', () => {
        const loadProgress = (loadedFragments / totalFragments) * 100
        updateProgress(loadProgress, video.currentTime, video.duration)
      })

      // 录制整个视频时长
      video.addEventListener('ended', () => {
        mediaRecorder.stop()
        console.log('录制结束')
      });
    } catch (error) {
      console.error('播放视频失败:', error)
    }
  })
}

const handleClear = () => {
  url.value = ''
}

</script>

<style lang="less" scoped>
.page-m3u8 {
  .m3u8-content {
    width: 600px;
    padding-top: 300px;
  }
}
</style>