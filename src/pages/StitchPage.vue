<template>
  <div class="page-wrapper page-stitch" id="page-stitch">
    <el-tooltip :content="direction === '1' ? '横向' : '竖向'" placement="right">
      <el-switch
        v-model="direction"
        class="stitch-radio"
        style="--el-switch-off-color: #ff4949"
        size="large"
        :active-action-icon="Right"
        :inactive-action-icon="Bottom"
        active-value="1"
        inactive-value="2"
      />
    </el-tooltip>
    <el-upload
      ref="upload"
      action=""
      multiple
      accept="image/png,image/jpeg,image/webp"
      style="position: absolute;"
      :show-file-list="false"
      :auto-upload="false"
      :on-change="handleUpload"
    >
      <el-tooltip content="上传图片" placement="left">
        <el-icon class="stitch-icon add"><UploadFilled /></el-icon>
      </el-tooltip>
    </el-upload>
    <el-tooltip content="清空" placement="bottom">
      <el-icon class="stitch-icon delete" @click.stop="handleDelete"><Refresh /></el-icon>
    </el-tooltip>
    <el-tooltip content="下载" placement="bottom">
      <el-icon class="stitch-icon download" @click.stop="handleDownload"><Download /></el-icon>
    </el-tooltip>
    <VueDraggableNext
      class="stitch-delete"
      :class="drag ? 'delete' : ''"
      v-bind="{ group: 'delete' }"
      v-model="deletes"
    >
      <span v-if="drag">拖进此区域删除</span>
    </VueDraggableNext>
    <div
      class="stitch-content"
      :class="[direction === '1' ? 'horizontal' : 'vertical', images.length === 0 ? 'center' : '']"
    >
      <VueDraggableNext
        v-if="images.length > 0"
        class="stitch-draggable"
        id="stitch-canvas"
        v-model="images"
        draggable=".image"
        v-bind="{ group: 'delete' }"
        @start="drag = true"
        @end="handleDragEnd"
      >
        <div class="image" v-for="(item, index) in images" :key="index">
          <img :src="item" alt="">
        </div>
      </VueDraggableNext>
      <el-upload
        v-else
        ref="uploadCenter"
        action=""
        multiple
        accept="image/png,image/jpeg,image/webp"
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handleUpload"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div>点击上传图片</div>
      </el-upload>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElLoading, ElNotification } from 'element-plus'
import { Right, Bottom } from '@element-plus/icons-vue'
import { VueDraggableNext } from 'vue-draggable-next'
import domtoimage from '../utils/dom-to-image'

const direction = ref('1')

const images = ref([])
const deletes = ref([])

const upload = ref()
const uploadCenter = ref()

const drag = ref(false)

const handleDragEnd = () => {
  deletes.value = []
  setTimeout(() => {
    drag.value = false
  }, 150)
}

const handleDelete = () => {
  images.value = []
  deletes.value = []
}

const handleUpload = (file) => {
  const url = URL.createObjectURL(file.raw)
  images.value.push(url)
  upload.value?.clearFiles?.()
  uploadCenter.value?.clearFiles?.()
}

const downloadFile = (href, fileName = '图片') => {
  const downloadElement = document.createElement('a')
  downloadElement.href = href
  downloadElement.download = `${fileName}.png`
  document.body.appendChild(downloadElement)
  downloadElement.click()
  document.body.removeChild(downloadElement)
  window.URL.revokeObjectURL(href)
}

const handleDownload = () => {
  if (images.value.length === 0) {
    ElNotification({
      title: '提示',
      message: '请先上传图片',
      type: 'error',
    })
    return
  }
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    lock: true,
    target: document.getElementById('page-stitch'),
    text: '生成中...'
  })
  domtoimage.toPng(document.getElementById('stitch-canvas'), { scale: 2 })
    .then(function (url) {
      downloadFile(url)
      setTimeout(() => {
        loadingInstance.close()
      }, 200)
    })
    .catch(function () {
      setTimeout(() => {
        loadingInstance.close()
        ElNotification({
          title: '提示',
          message: '生成图片失败',
          type: 'error',
        })
      }, 200)
    })
}
</script>

<style lang="less" scoped>
.page-stitch {
  position: relative;
  padding: 0 !important;
  .stitch-delete {
    position: fixed;
    width: calc(100% - 200px);
    height: 70px;
    left: 200px;
    top: 0;
    overflow: hidden;
    &.delete {
      z-index: 20;
      transition: background-color 0.15s;
      background-color: var(--el-color-danger-light-9);
      span {
        position: absolute;
        font-size: 16px;
        font-weight: 700;
        color: var(--el-color-danger);
        left: 50%;
        top: 50%;
        line-height: 1;
        transform: translate(-50%, -50%);
      }
    }
    .image {
      opacity: 0;
    }
  }
  .stitch-radio {
    position: fixed;
    left: 220px;
    top: 10px;
    z-index: 10;
  }
  .stitch-icon {
    position: fixed;
    right: 30px;
    top: 20px;
    z-index: 10;
    color: var(--el-color-primary);
    font-size: 28px;
    cursor: pointer;
    &.add {
      right: 130px;
    }
    &.delete {
      right: 80px;
    }
  }
  .stitch-content {
    display: flex;
    height: calc(100% - 70px);
    margin-top: 70px;
    overflow: hidden;
    &.horizontal {
      align-items: center;
      overflow-x: auto;
      overflow-y: hidden;
      .stitch-draggable {
        height: 60%;
        white-space: nowrap;
      }
      .image {
        display: inline-block;
        height: 100%;
        img {
          height: 100%;
          width: auto;
        }
      }
    }
    &.vertical {
      width: 100%;
      justify-content: center;
      overflow-x: hidden;
      overflow-y: auto;
      .stitch-draggable {
        width: 50%;
      }
      img {
        display: block;
        width: 100%;
      }
      .stitch-images {
        width: 50%;
        overflow: hidden;
        
      }
    }
    &.center {
      overflow: hidden;
      align-items: center;
      justify-content: center;
      :deep(.el-upload) {
        flex-direction: column;
        color: var(--el-text-color-placeholder);
        .el-icon {
          font-size: 80px;
        }
      }
    }
  }
  .image {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    &::after {
      transition: background-color 0.15s;
    }
    &:hover {
      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background-color: rgba(255, 255, 255, 0.15);
      }
    }
  }
}
</style>