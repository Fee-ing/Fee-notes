<template>
  <div class="page-wrapper page-m3u8 flex-vh">
    <div class="m3u8-content flex-col">
      <el-input
        v-model="url"
        type="textarea"
        resize="none"
        :rows="3"
        placeholder="请输入.m3u8格式的链接"
        class="m3u8-input"
      ></el-input>
      <div class="m3u8-footer flex-v">
        <div class="flex-1">
          <span v-if="downloadLoading">下载进度 {{downloadProgress}}%</span>
        </div>
        <el-button type="primary" plain :icon="downloadLoading ? Loading : Position" circle @click="handleStart"></el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElNotification } from 'element-plus'
import { Position, Loading } from '@element-plus/icons-vue'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

const url = ref('')
const downloadLoading = ref(false)
const downloadProgress = ref(0)
const documentTitle = document.title

let videoElement = null
let videoRecorder = null
let videoChunks = []
let totalFragmentsVideo = 0
let loadedFragmentsVideo = 0

let audioElement = null
let audioRecorder = null
let audioChunks = []
let totalFragmentsAudio = 0
let loadedFragmentsAudio = 0

watch(downloadLoading, (newValue) => {
  if (newValue) {
    document.title = `下载进度${downloadProgress.value}% - ${documentTitle}`
  } else {
    document.title = documentTitle
  }
})

const handleStart = () => {
  if (downloadLoading.value) {
    console.log('取消下载')
    downloadLoading.value = false
    downloadProgress.value = 0
    audioRecorder?.stop?.()
    videoRecorder?.stop?.()
    console.log('Recording cancelled by user')
    return
  }
  downloadProgress.value = 0
  downloadLoading.value = true
  downloadVideoByHls()
  downloadAudioByHls()
}

const checkM3u8ForTracks = async (m3u8Url) => {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement('video')
    const hls = new Hls()

    // 监听 MANIFEST_PARSED 事件以获取媒体信息
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const tracks = hls.audioTracks.concat(hls.levels.map(level => level.videoCodec))
      let hasVideo = false
      let hasAudio = false

      tracks.forEach(track => {
        if (typeof track === 'string') {
          if (track.includes('avc')) {
            hasVideo = true
          }
        } else if (track.type) {
          if (track.type === 'audio') {
            hasAudio = true
          }
        }
      })

      resolve({ hasVideo, hasAudio })
      hls.destroy()
    })

    // 监听错误事件
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS Error:', data)
      reject(new Error(`Failed to parse M3U8 file: ${data.reason}`))
      hls.destroy()
    })

    // 加载 .m3u8 文件
    hls.loadSource(m3u8Url)
    hls.attachMedia(videoElement)
  })
}

const downloadVideoByHls = () => {
  const videoM3u8Url = 'https://video.twimg.com/amplify_video/1891080744019415040/pl/avc1/480x852/UkyylCx0HXeqAFZW.m3u8'
  videoElement = document.createElement('video')
  const hlsVideo = new Hls()

  // 加载视频 .m3u8 文件
  hlsVideo.loadSource(videoM3u8Url)
  hlsVideo.attachMedia(videoElement)

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
          hlsVideo.destroy()
          downloadLoading.value = false
          ElNotification.error({
            title: 'Error',
            message: '下载视频失败'
          })
          break
      }
    }
  })

  totalFragmentsVideo = 0
  loadedFragmentsVideo = 0

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

      const hasVideoTrack = videoStream.getVideoTracks().length > 0
      console.log(`Has Video Track: ${hasVideoTrack}`)

      if (!hasVideoTrack) {
        console.error('Video track missing in the streams.')
        downloadLoading.value = false
        return
      }

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
        mergeFiles()
      }

      // 开始录制
      videoRecorder.start()
      console.log('Video Recordings started')

      // 监听加载和录制进度
      hlsVideo.on(Hls.Events.FRAG_LOADED, (event, data) => {
        loadedFragmentsVideo++
        const loadProgressVideo = (loadedFragmentsVideo / totalFragmentsVideo) * 100
        updateProgress(loadProgressVideo, loadedFragmentsAudio, videoElement.currentTime, videoElement.duration, 'progress')
      })

      // 监听视频播放时间更新
      videoElement.addEventListener('timeupdate', () => {
        const loadProgressVideo = (loadedFragmentsVideo / totalFragmentsVideo) * 100
        const loadProgressAudio = (loadedFragmentsAudio / totalFragmentsAudio) * 100
        updateProgress(loadProgressVideo, loadProgressAudio, videoElement.currentTime, videoElement.duration, 'video')
      })

      // 录制整个视频时长
      videoElement.addEventListener('ended', () => {
        audioRecorder?.stop?.()
        videoRecorder?.stop?.()
        console.log('Recording ended')

        downloadLoading.value = false
      })
    } catch (error) {
      console.error('Failed to play video:', error)
    }
  })

}

const downloadAudioByHls = () => {
  const audioM3u8Url = 'https://video.twimg.com/amplify_video/1891080744019415040/pl/mp4a/64000/Xt63R0Pk2icsy5-6.m3u8'
  
  audioElement = document.createElement('audio')
  
  const hlsAudio = new Hls()

  // 加载音频 .m3u8 文件
  hlsAudio.loadSource(audioM3u8Url)
  hlsAudio.attachMedia(audioElement)

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
          hlsAudio.destroy()
          downloadLoading.value = false
          ElNotification.error({
            title: 'Error',
            message: '下载音频失败'
          })
          break
      }
    }
  })

  totalFragmentsAudio = 0
  loadedFragmentsAudio = 0

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
      // const audioStream = audioElement.captureStream()
      const audioContext = new AudioContext()
      const mediaStreamDestination = audioContext.createMediaStreamDestination()
      // 将音频元素连接到媒体流目的地
      const source = audioContext.createMediaElementSource(audioElement)
      source.connect(mediaStreamDestination)

      const audioStream = mediaStreamDestination.stream

      const hasAudioTrack = audioStream.getAudioTracks().length > 0
      console.log(`Has Audio Track: ${hasAudioTrack}`)

      if (!hasAudioTrack) {
        console.error('Audio track missing in the streams.')
        downloadLoading.value = false
        return
      }

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
      }

      // 开始录制
      audioRecorder.start()
      console.log('Audio Recordings started')

      // 监听加载和录制进度
      hlsAudio.on(Hls.Events.FRAG_LOADED, (event, data) => {
        loadedFragmentsAudio++
        const loadProgressAudio = (loadedFragmentsAudio / totalFragmentsAudio) * 100
        updateProgress(loadedFragmentsVideo, loadProgressAudio, videoElement.currentTime, videoElement.duration, 'audio')
      })

    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  })
}

// 更新进度
const updateProgress = (loadProgressVideo, loadProgressAudio, currentTimeVideo, durationVideo, type) => {
  let recordProgressVideo = 0
  let recordProgressAudio = 0
  if (!isNaN(durationVideo) && durationVideo !== Infinity) {
    recordProgressVideo = (currentTimeVideo / durationVideo) * 100
  }
  const overallProgressVideo = (loadProgressVideo + recordProgressVideo) / 2 // 综合加载和录制进度
  const overallProgressAudio = (loadProgressAudio + recordProgressAudio) / 2 // 综合加载和录制进度
  const overallProgress = (overallProgressVideo + overallProgressAudio) / 2 // 综合音视频进度

  if (type === 'progress') {
    downloadProgress.value = overallProgress.toFixed(2)
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
  const outputBlob = new Blob([data.buffer], { type: 'video/mp4' })
  const url = URL.createObjectURL(outputBlob)

  // 提供下载链接
  const a = document.createElement('a')
  a.href = url
  a.download = 'merged_video.mp4'
  a.click()
  URL.revokeObjectURL(url)

  console.log('Files merged and downloaded')
}
</script>

<style lang="less" scoped>
.page-m3u8 {
  .m3u8-content {
    width: 700px;
    background-color: #f3f5f9;
    border-radius: 14px;
    overflow: hidden;
  }
  .m3u8-input {
    :deep(.el-textarea__inner) {
      background-color: #f3f5f9;
      border: none;
      box-shadow: none;
      padding: 20px;
    }
  }
  .m3u8-footer {
    padding: 10px 10px 10px 20px;
  }
}
</style>