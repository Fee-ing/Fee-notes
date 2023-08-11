<template>
  <div class="page-wrapper">
    <canvas class="code-canvas" id="qrcode"></canvas>
    <el-form class="form-wrapper" label-position="top" size="small">
      <el-form-item label="上传图片">
        <div>
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            :show-file-list="false"
            :on-change="handleUpload"
            ref="uploadEle"
          >
            <el-button type="primary" plain>点击上传</el-button>
          </el-upload>
          <el-image class="image-wrapper" :src="path" fit="cover">
            <template #error>
              <div class="image-slot flex-vh">
                <el-icon>
                  <component :is="'Picture'"></component>
                </el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </el-form-item>
      <el-form-item label="识别结果">
        <el-input v-model="result" type="textarea" resize="none" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleStart">开始</el-button>
        <el-button class="copy-btn" :data-clipboard-text="result">复制</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElNotification } from 'element-plus'
import ClipboardJS from 'clipboard'

var CV = null
var qrcodeDetector = null

const uploadEle = ref(null)
const path = ref('')
const result = ref('')

const handleUpload = (file) => {
  result.value = ''
  path.value = URL.createObjectURL(file.raw)
  let img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const { width, height } = img
    let canvas = document.getElementById('qrcode')
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)
  }
  img.src = path.value
  uploadEle.value.clearFiles()
}

const handleStart = () => {
  const inputImage = CV.imread('qrcode', CV.IMREAD_GRAYSCALE)
  const points_vec = new CV.MatVector()
  const res = qrcodeDetector.detectAndDecode(inputImage, points_vec)
  if (res.size() === 0) {
    ElNotification({
      title: '提示',
      message: '解析失败',
      type: 'error',
    })
  } else {
    result.value = res.get(0)
  }
}

const fetchModelsData = async (name) => {
  const response = await fetch(`/Fee-notes/models/${name}`, { method: 'GET' })
  const data = await response.arrayBuffer()
  return new Uint8Array(data)
}

const createDataFile = async (name) => {
  try {
    const data = await fetchModelsData(name)
    CV.FS_createDataFile('/', name, data, true, false, false)
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  if (cv) {
    CV = await cv
    await createDataFile('detect.prototxt')
    await createDataFile('detect.caffemodel')
    await createDataFile('sr.prototxt')
    await createDataFile('sr.caffemodel')
    qrcodeDetector = new CV.wechat_qrcode_WeChatQRCode(
      'detect.prototxt',
      'detect.caffemodel',
      'sr.prototxt',
      'sr.caffemodel'
    )
  }

  const clipboard = new ClipboardJS('.copy-btn')
  clipboard.on('success', function (e) {
    ElNotification({
      title: '提示',
      message: '复制成功',
      type: 'success',
    })
    e.clearSelection()
  })
  clipboard.on('error', function () {
    ElNotification({
      title: '提示',
      message: '复制失败，请重试',
      type: 'error',
    })
  })
})
</script>

<style lang="less" scoped>
.code-canvas {
  position: absolute;
  left: -10000px;
  top: -10000px;
  opacity: 0;
  z-index: -100;
}
.form-wrapper {
  width: 400px;
  :deep(.el-textarea__inner) {
    height: 100px;
  }
}
.image-wrapper {
  width: 200px;
  height: 200px;
  margin-top: 10px;
  .image-slot {
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 30px;
  }
}
</style>