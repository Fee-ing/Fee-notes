<template>
  <div class="page-wrapper page-m3u8 flex-h">
    <div class="m3u8-content flex-col">
      <div class="input-form">
        <el-input
          v-model="inputContent"
          type="textarea"
          resize="none"
          :rows="2"
          :disabled="downloadLoading"
          placeholder="请输入.m3u8格式的链接"
          class="input-content"
        ></el-input>
        <div class="input-footer flex-v">
          <div class="flex-1">
            <span v-if="downloadLoading">下载进度：{{downloadProgress}}%</span>
          </div>
          <el-button type="primary" plain :icon="downloadLoading ? null : Position" circle @click="handleStart"></el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Position } from '@element-plus/icons-vue'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

const inputContent = ref('')
const downloadLoading = ref(false)
const downloadProgress = ref(0)
const downloadType = ref('video')
const documentTitle = document.title

let videoElement = null
let videoRecorder = null
let videoChunks = []

let audioElement = null
let audioRecorder = null
let audioChunks = []

watch(downloadLoading, (newValue) => {
  if (newValue) {
    document.title = `下载进度${downloadProgress.value}% - ${documentTitle}`
  } else {
    document.title = documentTitle
  }
})

const handleStart = async () => {
  if (downloadLoading.value) {
    console.log('取消下载')
    downloadLoading.value = false
    downloadProgress.value = 0
    audioRecorder?.stop?.()
    videoRecorder?.stop?.()
    console.log('Recording cancelled by user')
    return
  }
  // 正则表达式模式，用于匹配 .m3u8 链接
  const regexPattern = /https?:\/\/[^\s"'()]+\.m3u8(\?.*)?/g
  const m3u8UrlList = inputContent.value.match(regexPattern)
  if (!m3u8UrlList) {
    ElNotification.error({
      title: 'Error',
      message: '请输入正确的.m3u8链接'
    })
    return
  }
  videoElement = null
  videoRecorder = null
  videoChunks = []
  audioElement = null
  audioRecorder = null
  audioChunks = []
  downloadLoading.value = true
  let videoM3u8Url = '', audioM3u8Url = ''
  for (let index = 0; index < m3u8UrlList.length; index++) {
    if (videoM3u8Url && audioM3u8Url) break
    const m3u8Url = m3u8UrlList[index]
    const res = await checkMediaTracks(m3u8Url)
    if (!res) {
      downloadLoading.value = false
      return
    }
    const { hasVideo, hasAudio } = res
    if (hasVideo && hasAudio) {
      downloadType.value = 'video'
      downloadProgress.value = 0
      downloadVideoByHls(m3u8Url)
      return
    } else if (hasVideo && !hasAudio) {
      videoM3u8Url = m3u8Url
    } else if (!hasVideo && hasAudio) {
      audioM3u8Url = m3u8Url
    }
  }
  if (!videoM3u8Url && !audioM3u8Url) {
    ElNotification.error({
      title: 'Error',
      message: '未检测到音视频文件'
    })
    downloadLoading.value = false
    return
  } else if (videoM3u8Url && audioM3u8Url) {
    downloadType.value = 'merge'
    downloadProgress.value = 0
    downloadVideoByHls(videoM3u8Url)
    downloadAudioByHls(audioM3u8Url)
  } else if (!videoM3u8Url) {
    ElMessageBox.confirm(
      '文件只包含音频，是否下载?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      downloadType.value = 'audio'
      downloadProgress.value = 0
      downloadAudioByHls(audioM3u8Url)
    }).catch(() => {
      console.log('取消下载')
    })
  } else if (!audioM3u8Url) {
    ElMessageBox.confirm(
      '文件不包含音频，是否下载?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      downloadType.value = 'video'
      downloadProgress.value = 0
      downloadVideoByHls(videoM3u8Url)
    }).catch(() => {
      console.log('取消下载')
    })
  }
}

const checkMediaTracks = async (m3u8Url) => {
  return new Promise((resolve) => {
    const hls = new Hls()
    const video = document.createElement('video')

    // 监听 MANIFEST_PARSED 事件，检查音视频轨道
    hls.on(Hls.Events.MANIFEST_PARSED, async (event, data) => {
      try {
        await video.play().catch(error => {
          console.error('Failed to play video:', error)
        })
        console.log('Video is playing')

        const videoStream = video.captureStream()
        const hasVideo = videoStream.getVideoTracks().length > 0
        console.log(`Has Video Track: ${hasVideo}`)
        const hasAudio = videoStream.getAudioTracks().length > 0
        console.log(`Has Audio Track: ${hasAudio}`)
        resolve({ hasVideo, hasAudio })
        hls.destroy()
      } catch (error) {
        console.error('Failed to play video:', error)
        ElNotification.error({
          title: 'Error',
          message: '加载.m3u8文件失败'
        })
        resolve(null)
        hls.destroy()
      }
    })

    // 监听错误事件
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS Error:', data)
      ElNotification.error({
        title: 'Error',
        message: '加载.m3u8文件失败'
      })
      resolve(null)
      hls.destroy()
    })

    // 加载 .m3u8 文件
    hls.loadSource(m3u8Url)
    hls.attachMedia(video)
  })
}

const downloadVideoByHls = (videoM3u8Url) => {
  videoElement = document.createElement('video')
  videoElement.volume = 0.001
  const hlsVideo = new Hls()

  // 加载视频 .m3u8 文件
  hlsVideo.loadSource(videoM3u8Url)
  hlsVideo.attachMedia(videoElement)

  const errorFunc = () => {
    audioRecorder?.stop?.()
    videoRecorder?.stop?.()
    ElNotification.error({
      title: 'Error',
      message: '下载视频失败'
    })
  }

  // 监听错误事件
  hlsVideo.on(Hls.Events.ERROR, (event, data) => {
    console.error('HLS Video Error:', data)
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('Network error, try to recover')
          hlsVideo.startLoad()
          break
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('Media error, try to recover')
          hlsVideo.recoverMediaError()
          break
        default:
          console.error('Unrecoverable error')
          errorFunc()
          break
      }
    }
  })

  let totalFragmentsVideo = 0
  let loadedFragmentsVideo = 0

  // 监听 LEVEL_LOADED 事件以获取总片段数
  hlsVideo.on(Hls.Events.LEVEL_LOADED, (event, data) => {
    if (data.details && data.details.fragments) {
      totalFragmentsVideo = data.details.fragments.length
      console.log(`Total video fragments: ${totalFragmentsVideo}`)
    }
  })

  // 监听 MANIFEST_PARSED 事件，表示视频可以播放
  hlsVideo.on(Hls.Events.MANIFEST_PARSED, async () => {
    console.log('Video Manifest parsed, starting playback...')
    try {
      await videoElement.play().catch(error => {
        console.error('Failed to play video:', error)
      })
      console.log('Video is playing')

      // 创建 MediaRecorder
      const videoStream = videoElement.captureStream()

      videoRecorder = new MediaRecorder(videoStream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000  // 设置比特率为 5 Mbps
      })

      videoChunks = []
      videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data)
        }
      }

      videoRecorder.onstop = () => {
        console.log('Video recording stopped')
        if (audioChunks.length > 0) {
          // 若有需要合并的音频文件，则合并音视频文件下载
          mergeFiles()
        } else {
          downloadMp4(videoChunks)
        }
        hlsVideo.destroy()
        downloadLoading.value = false
      }

      // 开始录制
      videoRecorder.start()
      console.log('Video Recordings started')

      // 监听加载和录制进度
      hlsVideo.on(Hls.Events.FRAG_LOADED, (event, data) => {
        loadedFragmentsVideo++
        const loadProgressVideo = (loadedFragmentsVideo / totalFragmentsVideo) * 100
        updateProgress(loadProgressVideo, videoElement.currentTime, videoElement.duration)
      })

      // 监听视频播放时间更新
      videoElement.addEventListener('timeupdate', () => {
        const loadProgressVideo = (loadedFragmentsVideo / totalFragmentsVideo) * 100
        updateProgress(loadProgressVideo, videoElement.currentTime, videoElement.duration)
      })

      // 录制整个视频时长
      videoElement.addEventListener('ended', () => {
        audioRecorder?.stop?.()
        videoRecorder?.stop?.()
        downloadProgress.value = 100
        console.log(`Download Progress: ${downloadProgress.value}%`)
      })
    } catch (error) {
      console.error('Failed to play video:', error)
      errorFunc()
    }
  })
}

const downloadAudioByHls = (audioM3u8Url) => {
  audioElement = document.createElement('audio')
  
  const hlsAudio = new Hls()

  // 加载音频 .m3u8 文件
  hlsAudio.loadSource(audioM3u8Url)
  hlsAudio.attachMedia(audioElement)

  const errorFunc = () => {
    audioRecorder?.stop?.()
    videoRecorder?.stop?.()
    ElNotification.error({
      title: 'Error',
      message: '下载音频失败'
    })
  }

  hlsAudio.on(Hls.Events.ERROR, (event, data) => {
    console.error('HLS Audio Error:', data)
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.error('Network error, try to recover')
          hlsAudio.startLoad()
          break
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('Media error, try to recover')
          hlsAudio.recoverMediaError()
          break
        default:
          console.error('Unrecoverable error')
          errorFunc()
          break
      }
    }
  })

  let totalFragmentsAudio = 0
  let loadedFragmentsAudio = 0

  hlsAudio.on(Hls.Events.LEVEL_LOADED, (event, data) => {
    if (data.details && data.details.fragments) {
      totalFragmentsAudio = data.details.fragments.length
      console.log(`Total audio fragments: ${totalFragmentsAudio}`)
    }
  })

  hlsAudio.on(Hls.Events.MANIFEST_PARSED, async () => {
    console.log('Audio Manifest parsed, starting playback...')
    try {
      await audioElement.play().catch(error => {
        console.error('Failed to play audio:', error)
      })
      console.log('Audio is playing')

      // 创建 MediaRecorder
      const audioContext = new AudioContext()
      const mediaStreamDestination = audioContext.createMediaStreamDestination()
      // 将音频元素连接到媒体流目的地
      const source = audioContext.createMediaElementSource(audioElement)
      source.connect(mediaStreamDestination)

      const audioStream = mediaStreamDestination.stream

      audioRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 192000   // 设置音频比特率为 192 kbps
      })

      audioChunks = []
      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      audioRecorder.onstop = () => {
        console.log('Audio recording stopped')
        if (downloadType.value === 'audio') {
          downloadMp4(audioChunks)
        }
        hlsAudio.destroy()
        downloadLoading.value = false
      }

      // 开始录制
      audioRecorder.start()
      console.log('Audio Recordings started')

      if (downloadType.value === 'audio') {
        // 监听加载和录制进度
        hlsAudio.on(Hls.Events.FRAG_LOADED, (event, data) => {
          loadedFragmentsAudio++
          const loadProgressAudio = (loadedFragmentsAudio / totalFragmentsAudio) * 100
          updateProgress(loadProgressAudio, audioElement.currentTime, audioElement.duration)
        })

        // 监听视频播放时间更新
        audioElement.addEventListener('timeupdate', () => {
          const loadProgressAudio = (loadedFragmentsAudio / totalFragmentsAudio) * 100
          updateProgress(loadProgressAudio, audioElement.currentTime, audioElement.duration)
        })

        audioElement.addEventListener('ended', () => {
          audioRecorder?.stop?.()
          downloadProgress.value = 100
          console.log(`Download Progress: ${downloadProgress.value}%`)
        })
      }
    } catch (error) {
      console.error('Failed to play audio:', error)
      errorFunc()
    }
  })
}

// 更新进度
const updateProgress = (loadProgress, currentTime, duration, type) => {
  const recordProgress = (currentTime / duration) * 100
  const overallProgress = (loadProgress + recordProgress) / 2
  if (overallProgress) {
    downloadProgress.value = overallProgress.toFixed(2)
    console.log(`Download Progress: ${downloadProgress.value}%`)
    if (downloadLoading.value) {
      document.title = `下载进度${downloadProgress.value}% - ${documentTitle}`
    }
  }
}

// 合并视频和音频文件
const mergeFiles = async () => {
  if (typeof SharedArrayBuffer === 'undefined') {
    console.error('SharedArrayBuffer is not supported in this environment.')
    // return
  }

  console.log('Merging files...')
  const ffmpeg = createFFmpeg({ log: true })
  await ffmpeg.load()

  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
  const videoBlob = new Blob(videoChunks, { type: 'video/webm' })

  ffmpeg.FS('writeFile', 'input_audio.webm', await fetchFile(audioBlob))
  ffmpeg.FS('writeFile', 'input_video.webm', await fetchFile(videoBlob))

  await ffmpeg.run('-i', 'input_audio.webm', '-i', 'input_video.webm', '-c:v', 'copy', '-c:a', 'aac', 'output.mp4')

  const data = ffmpeg.FS('readFile', 'output.mp4')
  downloadMp4([data.buffer])
}

const downloadMp4 = (chunks) => {
  const outputBlob = new Blob(chunks, { type: 'video/mp4' })
  const url = URL.createObjectURL(outputBlob)

  // 提供下载链接
  const a = document.createElement('a')
  a.href = url
  a.download = 'm3u8-video.mp4'
  a.click()
  URL.revokeObjectURL(url)

  console.log('Files merged and downloaded')
}
</script>

<style lang="less" scoped>
.page-m3u8 {
  .m3u8-content {
    width: 700px;
    padding-top: 300px;
  }
  .input-form {
    background-color: #f3f5f9;
    border-radius: 14px;
    overflow: hidden;
    .input-content {
      :deep(.el-textarea__inner) {
        background-color: #f3f5f9;
        border: none;
        box-shadow: none;
        padding: 20px;
      }
    }
    .input-footer {
      padding: 10px 10px 10px 20px;
    }
  }
  
}
</style>