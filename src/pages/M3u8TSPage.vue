<template>
  <div class="page-wrapper page-m3u8 flex-h">
    <!-- <section class="m-p-input-container">
      <input :disabled="downloading" placeholder="请输入 m3u8 链接" v-model="url" @keyup.enter="getM3U8(false)">
      <template v-if="!downloading || rangeDownload.isShowRange">
        <div @click="getM3U8(true)" v-if="!rangeDownload.isShowRange">特定范围下载</div>
        <template v-else>
          <input :disabled="downloading" placeholder="起始片段" v-model="rangeDownload.startSegment" class="range-input"
            type="number">
          <input :disabled="downloading" placeholder="截止片段" v-model="rangeDownload.endSegment" class="range-input"
            type="number">
        </template>
      </template>
      <template v-if="!downloading">
        <div @click="getM3U8(false)">原格式下载</div>
        <div @click="getMP4">转码为MP4下载</div>
      </template>
      <div class="disable" v-else-if="finishNum === rangeDownload.targetSegment && rangeDownload.targetSegment > 0">
        下载完成
      </div>
      <div @click="togglePause" v-else>{{ isPause ? '恢复下载' : '暂停下载' }}</div>
    </section>

    <div @click="streamDownload(false)" class="m-p-stream" v-if="!downloading && isSupperStreamWrite">
      特大视频原格式下载，边下载边保存，彻底解决大文件下载内存不足问题
    </div>
    <div @click="streamDownload(true)" class="m-p-stream" v-if="!downloading && isSupperStreamWrite">
      特大视频 MP4 格式下载，边下载边保存，彻底解决大文件下载内存不足问题
    </div>

    <template v-if="finishList.length > 0">
      <div class="m-p-line"></div>
      <div @click="forceDownload" class="m-p-force" v-if="mediaFileList.length && !streamWriter">强制下载现有片段</div>
      <div class="m-p-tips">
        待下载碎片总量：{{ rangeDownload.targetSegment }}，已下载：{{ finishNum }}，错误：{{ errorNum }}，进度：{{ progress }}%
      </div>
      <div class="m-p-tips" :class="[errorNum ? 'error-tips' : '']">
        若某视频碎片下载发生错误，将标记为红色，可点击相应图标进行重试
      </div>
      <section class="m-p-segment">
        <div @click="retry(index)" class="item" :key="index" :class="[item.status]" :title="item.title"
          v-for="(item, index) in finishList">{{ index + 1 }}</div>
      </section>
    </template> -->
    <div class="m3u8-content flex-col-h">
      <div class="input-form">
        <el-input v-model="url" type="textarea" resize="none" :rows="3" :disabled="downloading"
          placeholder="请输入.m3u8格式的链接" class="input-content"></el-input>
        <div class="input-footer flex-v">
          <div class="flex-1 flex-v">
            <span class="footer-tip">{{ tips }}</span>
          </div>
          <el-button class="footer-button" type="primary" plain circle @click="handleStart">
            <el-icon v-if="downloading && !isPause">
              <MoreFilled />
            </el-icon>
            <el-icon v-if="downloading && isPause">
              <Refresh />
            </el-icon>
            <el-icon v-if="!downloading">
              <Promotion />
            </el-icon>
          </el-button>
        </div>
      </div>
      <div class="download-content flex-col-h" v-if="finishList.length > 0">
        <div class="content-tips flex-v">
          <el-tag type="warning" size="small" style="cursor: pointer;" @click="forceDownload" v-if="mediaFileList.length && !streamWriter">强制下载所有片段</el-tag>
          <span style="margin-left: 8px;font-size: 12px;">待下载碎片总量：{{ rangeDownload.targetSegment }}，已下载：{{ finishNum }}，错误：{{ errorNum }}，进度：{{ progress }}%，若某视频碎片下载发生错误，将标记为红色，可点击相应图标进行重试</span>
        </div>
        <section class="content-segments flex flex-wrap">
          <el-button circle plain @click="retry(index)" class="segments-item" :key="index" :type="item.status"
            v-for="(item, index) in finishList">{{ index + 1 }}</el-button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, inject } from 'vue';
const downloader = inject('downloader'); // 从插件注入工具函数
import { ElNotification } from 'element-plus'
import { Promotion, MoreFilled, Refresh } from '@element-plus/icons-vue'

const url = ref('');
const tips = ref('m3u8 视频在线提取工具');
const title = ref('');
const isPause = ref(false);
const isGetMP4 = ref(false);
const durationSecond = ref(0);
const downloading = ref(false);
const beginTime = ref('');
const errorNum = ref(0);
const finishNum = ref(0);
const downloadIndex = ref(0);
const finishList = ref([]);
const tsUrlList = ref([]);
const mediaFileList = ref([]);
const isSupperStreamWrite = ref(window.streamSaver && !window.streamSaver.useBlobFallback);
const streamWriter = ref(null);
const streamDownloadIndex = ref(0);

const rangeDownload = reactive({
  isShowRange: false,
  startSegment: '',
  endSegment: '',
  targetSegment: 1,
});

const aesConf = reactive({
  method: '',
  uri: '',
  iv: '',
  key: '',
  decryptor: null,
  stringToBuffer: (str) => new TextEncoder().encode(str),
});

// Computed
const progress = computed(() => {
  if (!rangeDownload.targetSegment) return 0;
  return ((finishNum.value / rangeDownload.targetSegment) * 100).toFixed(2);
});

const handleStart = () => {
  const regexPattern = /https?:\/\/[^\s"'()]+\.m3u8(\?.*)?/g
  if (!regexPattern.test(url.value)) {
    ElNotification.error({
      title: 'Error',
      message: '请输入正确的.m3u8链接'
    })
    return
  }
  if (!downloading.value) {
    resetData();
    downloading.value = true;
    getMP4();
  } else {
    togglePause();
  }
}

const resetData = () => {
  // url.value = '';
  title.value = '';
  tips.value = 'm3u8 视频在线提取工具';
  isPause.value = false;
  isGetMP4.value = false;
  durationSecond.value = 0;
  downloading.value = false;
  beginTime.value = '';
  errorNum.value = 0;
  finishNum.value = 0;
  downloadIndex.value = 0;
  streamDownloadIndex.value = 0;
  finishList.value = [];
  tsUrlList.value = [];
  mediaFileList.value = [];
  rangeDownload.isShowRange = false;
  rangeDownload.startSegment = '';
  rangeDownload.endSegment = '';
  rangeDownload.targetSegment = 1;
};

// Methods
const getSource = () => {
  const { href } = location;
  if (href.indexOf('?source=') > -1) {
    url.value = href.split('?source=')[1];
  }
};

const getDocumentTitle = () => {
  let docTitle = document.title;
  try {
    docTitle = window.top.document.title;
  } catch (e) {
    console.log(e);
  }
  return docTitle;
};

const onKeyup = (e) => {
  if (e.keyCode === 13) {
    getM3U8(false);
  }
};

const streamDownload = (isMp4) => {
  isGetMP4.value = isMp4;
  title.value = new URL(url.value).searchParams.get('title') || title.value;
  let fileName = title.value || downloader.formatTime(new Date(), 'YYYY_MM_DD_hh_mm_ss');
  if (document.title !== 'm3u8 downloader') {
    fileName = getDocumentTitle();
  }
  streamWriter.value = window.streamSaver.createWriteStream(`${fileName}.${isMp4 ? 'mp4' : 'ts'}`).getWriter();
  getM3U8(false);
};

const getMP4 = () => {
  isGetMP4.value = true;
  getM3U8(false);
};

const alertError = (msg) => {
  ElNotification.error({
    title: '提示',
    message: msg,
  });
  downloading.value = false;
  tips.value = 'm3u8 视频在线提取工具';
};

const dealTS = (tsData, index, cb) => {
  const decryptedData = aesConf.uri ? aesDecrypt(tsData, index) : tsData;
  conversionMp4(decryptedData, index, (mp4Data) => {
    mediaFileList.value[index - rangeDownload.startSegment + 1] = mp4Data;
    finishList.value[index].status = 'success';
    finishNum.value++;

    if (streamWriter.value) {
      for (let i = streamDownloadIndex.value; i < mediaFileList.value.length; i++) {
        if (mediaFileList.value[i]) {
          streamWriter.value.write(new Uint8Array(mediaFileList.value[i]));
          mediaFileList.value[i] = null; // Free memory
          streamDownloadIndex.value = i + 1;
        } else {
            break;
        }
      }
      if (streamDownloadIndex.value >= rangeDownload.targetSegment) {
        streamWriter.value.close();
      }
    } else if (finishNum.value === rangeDownload.targetSegment) {
      let fileName = title.value || downloader.formatTime(beginTime.value, 'YYYY_MM_DD_hh_mm_ss');
      if (document.title !== 'm3u8 downloader') {
        fileName = getDocumentTitle();
      }
      downloadFile(mediaFileList.value, fileName);
    }
    cb && cb();
  });
};

const downloadTS = () => {
  if (downloading.value && isPause.value) return;
  tips.value = 'ts 视频碎片下载中，请稍后';
  const download = () => {
    const isPaused = isPause.value;
    let currentIndex = downloadIndex.value;
    if (currentIndex >= rangeDownload.endSegment) {
      return;
    }
    downloadIndex.value++;
    if (finishList.value[currentIndex] && finishList.value[currentIndex].status === '') {
      finishList.value[currentIndex].status = 'primary';
      downloader.ajax({
        url: tsUrlList.value[currentIndex],
        type: 'file',
        success: (data) => {
          dealTS(data, currentIndex, () => {
            if (downloadIndex.value < rangeDownload.endSegment && !isPaused) download();
          });
        },
        fail: () => {
          errorNum.value++;
          finishList.value[currentIndex].status = 'danger';
          if (downloadIndex.value < rangeDownload.endSegment && !isPaused) download();
        },
      });
    } else {
      if (downloadIndex.value < rangeDownload.endSegment && !isPaused) download();
    }
  };

  for (let i = 0; i < Math.min(6, rangeDownload.targetSegment - finishNum.value); i++) {
    download();
  }
};

const conversionMp4 = (data, index, cb) => {
  if (isGetMP4.value) {
    // 明确地从 window 对象访问 muxjs
    const transmuxer = new window.muxjs.Transmuxer({ // <--- 修正后的代码
      keepOriginalTimestamps: true,
      duration: parseInt(durationSecond.value)
    });
    transmuxer.on('data', (segment) => {
      if (index === rangeDownload.startSegment - 1) {
        const combined = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
        combined.set(segment.initSegment, 0);
        combined.set(segment.data, segment.initSegment.byteLength);
        cb(combined.buffer);
      } else {
        cb(segment.data);
      }
    });
    transmuxer.push(new Uint8Array(data));
    transmuxer.flush();
  } else {
    cb(data);
  }
};

const getAES = () => {
  downloader.ajax({
    type: 'file',
    url: aesConf.uri,
    success: (key) => {
      aesConf.key = key;
      aesConf.decryptor = new downloader.AESDecryptor();
      aesConf.decryptor.expandKey(aesConf.key);
      downloadTS();
    },
    fail: () => {
      alertError('视频已加密，无法获取密钥');
    }
  })
}

const getM3U8 = (isRange = false) => {
  // if (!url.value) return alertError('请输入链接');
  // if (url.value.toLowerCase().indexOf('m3u8') === -1) return alertError('链接有误，请重新输入');
  // if (downloading.value) return alertError('资源下载中，请稍后');

  // Reset state
  tips.value = 'm3u8 文件下载中，请稍后';
  durationSecond.value = 0;
  mediaFileList.value = [];
  finishNum.value = 0;
  errorNum.value = 0;
  downloadIndex.value = 0;
  streamDownloadIndex.value = 0;
  beginTime.value = new Date();

  downloader.ajax({
    url: url.value,
    success: (content) => {
      tsUrlList.value = [];
      finishList.value = [];

      content.split('\n').forEach(line => {
        if (/^[^#]/.test(line)) {
          tsUrlList.value.push(downloader.applyURL(line, url.value));
          finishList.value.push({ title: line, status: '' });
        }
      });
      
      if (isRange) {
        rangeDownload.isShowRange = true;
        rangeDownload.endSegment = tsUrlList.value.length;
        rangeDownload.targetSegment = tsUrlList.value.length;
        return;
      }
      
      const start = Math.max(rangeDownload.startSegment || 1, 1);
      const end = Math.max(rangeDownload.endSegment || tsUrlList.value.length, 1);
      rangeDownload.startSegment = Math.min(start, end);
      rangeDownload.endSegment = Math.max(start, end);
      rangeDownload.targetSegment = rangeDownload.endSegment - rangeDownload.startSegment + 1;
      downloadIndex.value = rangeDownload.startSegment - 1;
      downloading.value = true;

      if (isGetMP4.value) {
        let tsCount = 0;
        content.split('\n').forEach(line => {
          if(line.toUpperCase().indexOf('#EXTINF:') > -1) {
            tsCount++;
            if (tsCount >= rangeDownload.startSegment && tsCount <= rangeDownload.endSegment) {
                durationSecond.value += parseFloat(line.split('#EXTINF:')[1]);
            }
          }
        })
      }
      
      if (content.indexOf('#EXT-X-KEY') > -1) {
        aesConf.method = (content.match(/(.*METHOD=([^,\s]+))/g) || ['', '', ''])[0].replace(/.*METHOD=/, '');
        aesConf.uri = (content.match(/(.*URI="([^"]+))"/g) || ['', '', ''])[0].replace(/.*URI="/, '').replace('"', '');
        aesConf.iv = (content.match(/(.*IV=([^,\s]+))/g) || ['', '', ''])[0].replace(/.*IV=/, '');
        aesConf.iv = aesConf.iv ? aesConf.stringToBuffer(aesConf.iv) : '';
        aesConf.uri = downloader.applyURL(aesConf.uri, url.value);
        getAES();
      } else {
        if(tsUrlList.value.length > 0) {
            downloadTS();
        } else {
            alertError('资源为空，请查看链接是否有效');
        }
      }
    },
    fail: () => {
      alertError('链接不正确，请查看链接是否有效');
    }
  });
};

const aesDecrypt = (data, index) => {
    let iv = aesConf.iv || new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, index]);
    return aesConf.decryptor.decrypt(data, 0, iv.buffer || iv, true);
};

const togglePause = () => {
  isPause.value = !isPause.value;
  if (!isPause.value) {
    retryAll(true);
  }
};

const retry = (index) => {
  if (finishList.value[index].status === 'danger') {
    finishList.value[index].status = '';
    downloader.ajax({
      url: tsUrlList.value[index],
      type: 'file',
      success: (data) => {
        errorNum.value--;
        dealTS(data, index);
      },
      fail: () => {
        finishList.value[index].status = 'danger';
      }
    });
  }
};

const retryAll = (force = false) => {
  if (!finishList.value.length || isPause.value) return;
  let minErrorIndex = downloadIndex.value;
  finishList.value.forEach((item, index) => {
    if (item.status === 'danger') {
      item.status = '';
      minErrorIndex = Math.min(minErrorIndex, index);
    }
  });
  errorNum.value = 0;
  
  if(downloadIndex.value >= rangeDownload.endSegment || force) {
    downloadIndex.value = minErrorIndex;
    downloadTS();
  } else {
    downloadIndex.value = minErrorIndex;
  }
};

const downloadFile = (fileList, fileName) => {
  tips.value = 'ts 碎片整合中，请留意浏览器下载';
  const blob = isGetMP4.value ? new Blob(fileList, { type: 'video/mp4' }) : new Blob(fileList, { type: 'video/MP2T' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.${isGetMP4.value ? 'mp4' : 'ts'}`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  downloading.value = false;
  tips.value = '下载完成';
};

const forceDownload = () => {
  if (mediaFileList.value.length) {
    let fileName = title.value || downloader.formatTime(beginTime.value, 'YYYY_MM_DD_hh_mm_ss');
    if (document.title !== 'm3u8 downloader') {
      fileName = getDocumentTitle();
    }
    downloadFile(mediaFileList.value, fileName);
  } else {
    alertError('当前无已下载片段');
  }
};


onMounted(() => {
  getSource();
  window.addEventListener('keyup', onKeyup);
  setInterval(() => retryAll(), 2000);
});

onUnmounted(() => {
  window.removeEventListener('keyup', onKeyup);
});

</script>

<style lang="less" scoped>
.page-m3u8 {
  overflow-y: auto;
  .m3u8-content {
    width: 100%;
    padding-top: 300px;
  }
  .input-form {
    width: 700px;
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
      :deep(.el-button) {
        width: 32px;
        height: 32px;
        overflow: hidden;
      }
      .footer-tip {
        font-size: 12px;
        color: var(--el-menu-active-color);
      }
      .footer-block {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        background-color: var(--el-menu-active-color);
        transition: .1s;
      }
      .footer-button {
        font-size: 18px;
        // &:hover {
        //   background-color: var(--el-color-primary) !important;
        //   .footer-block {
        //     background-color: #fff;
        //   }
        // }
        // &:focus {
        //   color: var(--el-menu-active-color);
        //   background-color: transparent;
        // }
      }
    }
  }
  .download-content {
    margin-top: 20px;
    width: 100%;
    .content-tips {
      height: 32px;
      overflow: hidden;
    }
    .content-segments {
      width: 100%;
      padding: 40px;
      .segments-item {
        width: 32px;
        margin: 5px;
      }
    }
  }
}
</style>