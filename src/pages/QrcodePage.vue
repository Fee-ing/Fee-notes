<template>
  <div class="page-wrapper page-qrcode flex">
    <el-form class="form-wrapper" label-width="100px" :model="form" size="small">
      <el-form-item label="类型：">
        <el-radio-group v-model="form.type">
          <el-radio-button label="qrcode">二维码</el-radio-button>
          <el-radio-button label="barcode">条形码</el-radio-button>
          <el-radio-button label="artcode">艺术码</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="内容：">
        <el-input v-model="form.text" type="textarea" resize="none" />
      </el-form-item>
      <template v-if="form.type === 'qrcode'">
        <el-form-item label="大小：">
          <el-input-number
            v-model="form.qrcode.width"
            :min="100"
            :max="1000"
            :step="1"
            step-strictly
          />
        </el-form-item>
        <el-form-item label="边距：">
          <el-input-number
            v-model="form.qrcode.margin"
            :min="0"
            :max="10"
            :step="0.1"
            step-strictly
          />
        </el-form-item>
        <el-form-item label="质量：">
          <el-input-number
            v-model="form.qrcode.quality"
            :min="0"
            :max="1"
            :step="0.01"
            step-strictly
          />
        </el-form-item>
        <el-form-item label="颜色：">
          <el-color-picker v-model="form.qrcode.colorDark" />
        </el-form-item>
        <el-form-item label="背景：">
          <el-color-picker v-model="form.qrcode.colorLight" />
        </el-form-item>
        <el-form-item label="纠错级别：">
          <el-radio-group v-model="form.qrcode.errorCorrectionLevel">
            <el-radio label="L"></el-radio>
            <el-radio label="M"></el-radio>
            <el-radio label="Q"></el-radio>
            <el-radio label="H"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图片类型：">
          <el-radio-group v-model="form.qrcode.type">
            <el-radio label="image/png">png</el-radio>
            <el-radio label="image/jpeg">jpeg</el-radio>
            <el-radio label="image/webp">webp</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
      <template v-else-if="form.type === 'barcode'">
        <el-form-item label="条码类型：">
          <el-select v-model="form.barcode.format">
            <el-option
              v-for="item in barcodeFormatOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="条形宽度：">
          <el-input-number
            v-model="form.barcode.width"
            :min="1"
            :max="10"
            :step="1"
            step-strictly
          />
        </el-form-item>
        <el-form-item label="高度：">
          <el-input-number
            v-model="form.barcode.height"
            :min="20"
            :max="1000"
            :step="1"
            step-strictly
          />
        </el-form-item>
        <el-form-item label="边距：">
          <el-input-number
            v-model="form.barcode.margin"
            :min="0"
            :max="100"
            :step="1"
            step-strictly
          />
        </el-form-item>
        <el-form-item label="颜色：">
          <el-color-picker v-model="form.barcode.lineColor" />
        </el-form-item>
        <el-form-item label="背景：">
          <el-color-picker v-model="form.barcode.background" />
        </el-form-item>
        <el-form-item label="是否展示文字：">
          <el-switch v-model="form.barcode.displayValue" />
        </el-form-item>
        <template v-if="form.barcode.displayValue">
          <el-form-item label="文字：">
            <el-input v-model="form.barcode.text" placeholder="不填则默认条码内容" />
          </el-form-item>
          <el-form-item label="文字样式：">
            <el-select v-model="form.barcode.fontOptions">
              <el-option label="默认" value="" />
              <el-option label="加粗" value="bold" />
              <el-option label="斜体" value="italic" />
              <el-option label="斜体加粗" value="bold italic" />
            </el-select>
          </el-form-item>
          <el-form-item label="文字对齐：">
            <el-radio-group v-model="form.barcode.textAlign">
              <el-radio-button label="left">靠左</el-radio-button>
              <el-radio-button label="center">居中</el-radio-button>
              <el-radio-button label="right">靠右</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="文字位置：">
            <el-radio-group v-model="form.barcode.textPosition">
              <el-radio-button label="top">上</el-radio-button>
              <el-radio-button label="bottom">下</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="文字大小：">
            <el-input-number
              v-model="form.barcode.fontSize"
              :min="10"
              :max="100"
              :step="1"
              step-strictly
            />
          </el-form-item>
          <el-form-item label="文字条码间隔：">
            <el-input-number
              v-model="form.barcode.textMargin"
              :min="0"
              :max="100"
              :step="1"
              step-strictly
            />
          </el-form-item>
        </template>
      </template>
      <template v-else-if="form.type === 'artcode'">
        <el-form-item label="宽度：">
          <el-input-number
            v-model="form.artcode.width"
            :min="102"
            :max="1000"
            :step="1"
            step-strictly
          />
        </el-form-item>
        <el-form-item label="边框：">
          <el-switch v-model="form.artcode.border" />
        </el-form-item>
        <el-form-item label="边距：" v-if="!form.artcode.border">
          <el-input-number
            v-model="form.artcode.margin"
            :min="0"
            :max="(form.artcode.width - 100) / 2"
            :step="1"
            step-strictly
          />
        </el-form-item>
        <el-form-item label="主题：">
          <el-radio-group v-model="form.artcode.theme">
            <el-radio label="electron">电子元件</el-radio>
            <el-radio label="cookie">饼干</el-radio>
            <el-radio label="pink">公主粉</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button type="primary" @click="handleUpdate" :loading="loading">生成</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="show-wrapper">
      <div class="show-box qrcode" v-show="!loading && form.type === 'qrcode' && qrcode.src">
        <img :src="qrcode.src" alt="二维码">
        <div class="box-options flex-vh">
          <div>大小：{{ qrcode.size }} x {{ qrcode.size }}</div>
          <el-link class="download-btn flex-vh" :underline="false" :href="qrcode.src" download="qrcode">
            <el-icon>
              <component :is="'Download'"></component>
            </el-icon>
          </el-link>
        </div>
      </div>
      <div class="show-box barcode" v-show="!loading && form.type === 'barcode' && barcode.success">
        <img id="barcode" />
        <div class="box-options flex-vh">
          <div>高度：{{ barcode.size }}</div>
          <el-link class="download-btn flex-vh" :underline="false" @click="handleDownloadBarcode">
            <el-icon>
              <component :is="'Download'"></component>
            </el-icon>
          </el-link>
        </div>
      </div>
      <div class="show-box artcode" v-show="!loading && form.type === 'artcode' && artcode.success">
        <div class="box-content" id="artcode"></div>
        <div class="box-options flex-vh">
          <div>大小：{{ artcode.width }} x {{ artcode.height }}</div>
          <el-link class="download-btn flex-vh" :underline="false" @click="handleDownloadArtcode">
            <el-icon>
              <component :is="'Download'"></component>
            </el-icon>
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElNotification } from 'element-plus'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import { download } from '../utils/func'
import ArtQrcode from '../utils/artqrcode'

import electronBorder from '../assets/qrcode/electron/border.png'
import electronEye from '../assets/qrcode/electron/eye.png'
import electronSingle from '../assets/qrcode/electron/single.png'
import electronSingle_2 from '../assets/qrcode/electron/single_2.png'
import electronRow4 from '../assets/qrcode/electron/row4.png'
import electronCol3 from '../assets/qrcode/electron/col3.png'
import electronCol2 from '../assets/qrcode/electron/col2.png'
import electronCol3_2 from '../assets/qrcode/electron/col3_2.png'
import electronCorner from '../assets/qrcode/electron/corner.png'
import electronRow2 from '../assets/qrcode/electron/row2.png'
import electronRow2_2 from '../assets/qrcode/electron/row2_2.png'
import electronRow2Col2 from '../assets/qrcode/electron/row2col2.png'
import electronRow2Col3 from '../assets/qrcode/electron/row2col3.png'
// import electronRow3 from '../assets/qrcode/electron/row3.png'
import electronRow3Col2 from '../assets/qrcode/electron/row3col2.png'
import cookieBorder from '../assets/qrcode/cookie/border.png'
import cookieCol2 from '../assets/qrcode/cookie/col2.png'
import cookieCorner from '../assets/qrcode/cookie/corner.png'
import cookieEye from '../assets/qrcode/cookie/eye.png'
import cookieRow2Col2 from '../assets/qrcode/cookie/row2col2.png'
import cookieRow3 from '../assets/qrcode/cookie/row3.png'
import cookieRow4 from '../assets/qrcode/cookie/row4.png'
import cookieSingle from '../assets/qrcode/cookie/single.png'
import pinkBorder from '../assets/qrcode/pinkgirl/border.jpg'
import pinkCol2 from '../assets/qrcode/pinkgirl/col2.png'
import pinkCorner from '../assets/qrcode/pinkgirl/corner.png'
import pinkEye from '../assets/qrcode/pinkgirl/eye.png'
import pinkRow2Col2 from '../assets/qrcode/pinkgirl/row2col2.png'
import pinkRow2Col3 from '../assets/qrcode/pinkgirl/row2col3.png'
import pinkRow3 from '../assets/qrcode/pinkgirl/row3.png'
import pinkRow3Col2 from '../assets/qrcode/pinkgirl/row3col2.png'
import pinkRow4 from '../assets/qrcode/pinkgirl/row4.png'
import pinkSingle from '../assets/qrcode/pinkgirl/single.png'

const barcodeFormatOptions = [
  { label: 'CODE128', value: 'CODE128' },
  { label: 'CODE128A', value: 'CODE128A' },
  { label: 'CODE128B', value: 'CODE128B' },
  { label: 'CODE128C', value: 'CODE128C' },
  { label: 'EAN13', value: 'EAN13' },
  { label: 'EAN8', value: 'EAN8' },
  { label: 'EAN5', value: 'EAN5' },
  { label: 'EAN2', value: 'EAN2' },
  { label: 'UPC', value: 'UPC' },
  { label: 'CODE39', value: 'CODE39' },
  { label: 'ITF-14', value: 'ITF-14' },
  { label: 'MSI', value: 'MSI' },
  { label: 'MSI10', value: 'MSI10' },
  { label: 'MSI11', value: 'MSI11' },
  { label: 'MSI1010', value: 'MSI1010' },
  { label: 'MSI1110', value: 'MSI1110' },
  { label: 'Pharmacode', value: 'Pharmacode' },
  { label: 'Codabar', value: 'Codabar' }
]

const initialData = {
  text: '',
  type: 'qrcode',
  qrcode: {
    width: 200,
    margin: 1,
    quality: 0.92,
    colorDark: '#000000',
    colorLight: '#ffffff',
    errorCorrectionLevel: 'H',
    type: 'image/png'
  },
  barcode: {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    text: '',
    fontOptions: '',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontSize: 14,
    background: '#ffffff',
    lineColor: '#000000',
    margin: 10
  },
  artcode: {
    width: 200,
    border: true,
    margin: 0,
    theme: 'electron'
  }
}

const form = reactive(JSON.parse(JSON.stringify(initialData)))

const qrcode = ref({ src: '', size: 0 })
const barcode = ref({ size: 0, success: false })
const artcode = ref({ width: 0, height: 0, success: false })
const loading = ref(false)

const createQrcode = () => {
  if (form.text === '') {
    ElNotification({
      title: '提示',
      message: '请输入二维码内容',
      type: 'error',
    })
    return
  }
  loading.value = true
  const { width, margin, quality, colorDark, colorLight, errorCorrectionLevel, type } = form.qrcode
  QRCode.toDataURL(form.text, {
    width,
    margin,
    quality,
    color: {
      dark: colorDark,
      light: colorLight
    },
    errorCorrectionLevel,
    type
  }, (err, src) => {
    setTimeout(() => {
      loading.value = false
    }, 1000)
    if (err) {
      ElNotification({
        title: '提示',
        message: '生成二维码失败',
        type: 'error',
      })
      return
    }
    qrcode.value = { src, size: width }
  })
}

const createBarcode = () => {
  if (form.text === '') {
    ElNotification({
      title: '提示',
      message: '请输入条形码内容',
      type: 'error',
    })
    return
  }
  loading.value = true
  JsBarcode('#barcode', form.text, {
    ...form.barcode,
    valid: (valid) => {
      barcode.value = { success: valid, size: form.barcode.height }
      setTimeout(() => {
        loading.value = false
      }, 1000)
      if (!valid) {
        ElNotification({
          title: '提示',
          message: '生成条形码失败，请填写正确的条码内容',
          type: 'error',
        })
        return
      }
    }
  })
}

const createArtcode = () => {
  if (form.text === '') {
    ElNotification({
      title: '提示',
      message: '请输入二维码内容',
      type: 'error',
    })
    return
  }
  loading.value = true
  const { width, border, margin, theme } = form.artcode
  let materials = {}, height = 0, codeWidth = 0, top = 0, left = 0
  if (theme === 'electron') {
    height = width
    codeWidth = border ? parseInt(width * 320 / 500) : width - margin * 2
    top = border ? parseInt(width * 85 / 500) : margin
    left = border ? parseInt(width * 80 / 500) : margin
    materials = {
      eye: electronEye,
      row4: electronRow4,
      col4: electronCol3,
      row2col3: electronRow2Col3,
      row3col2: electronRow3Col2,
      col3: [electronCol3, electronCol3_2],
      row2col2: electronRow2Col2,
      corner: electronCorner,
      row2: [electronRow2, electronRow2_2],
      col2: electronCol2,
      single: [electronSingle, electronSingle_2],
    }
    if (border) materials.border = electronBorder
  } else if (theme === 'cookie') {
    height = border ? parseInt(width * 10 / 7) : width
    codeWidth = border ? parseInt(width * 280 / 500) : width - margin * 2
    top = border ? parseInt(width * 110 / 500) : margin
    left = top
    materials = {
      eye: cookieEye,
      row4: cookieRow4,
      // col4: cookieCol2,
      // row2col3: cookieRow2Col2,
      // row3col2: cookieRow2Col2,
      // col3: [cookieCol2],
      row2col2: cookieRow2Col2,
      corner: cookieCorner,
      row2: [cookieRow3],
      col2: cookieCol2,
      single: [cookieSingle],
    }
    if (border) materials.border = cookieBorder
  } else if (theme === 'pink') {
    height = border ? parseInt(width * 10 / 7) : width
    codeWidth = border ? parseInt(width * 280 / 500) : width - margin * 2
    top = border ? parseInt(width * 110 / 500) : margin
    left = top
    materials = {
      eye: pinkEye,
      row4: pinkRow4,
      // col4: pinkCol2,
      row2col3: pinkRow2Col3,
      row3col2: pinkRow3Col2,
      // col3: [pinkCol2],
      row2col2: pinkRow2Col2,
      corner: pinkCorner,
      row2: [pinkRow3],
      col2: pinkCol2,
      single: [pinkSingle],
    }
    if (border) materials.border = pinkBorder
  }
  document.getElementById('artcode').innerHTML = ''
  new ArtQrcode(document.getElementById('artcode'), {
    text: form.text,
    width: width,
    height,
    codeWidth,
    codeHeight: codeWidth,
    top,
    left,
    materials
  }, (valid) => {
    artcode.value = { success: valid, width, height }
    setTimeout(() => {
      loading.value = false
    }, 1000)
    if (!valid) {
      ElNotification({
        title: '提示',
        message: '生成艺术码失败',
        type: 'error',
      })
    }
  })
}

const handleDownloadBarcode = () => {
  if (document.getElementById('barcode')) {
    download(document.getElementById('barcode').getAttribute('src'), 'barcode')
  }
}

const handleDownloadArtcode = () => {
  if (document.querySelector('#artcode img')) {
    download(document.querySelector('#artcode img').getAttribute('src'), 'artcode')
  }
}

const handleUpdate = () => {
  if (loading.value) return
  if (form.type === 'qrcode') {
    createQrcode()
  } else if (form.type === 'barcode') {
    createBarcode()
  } else if (form.type === 'artcode') {
    createArtcode()
  }
}

const handleReset = () => {
  form.text = ''
  if (form.type === 'qrcode') {
    form.qrcode = JSON.parse(JSON.stringify(initialData.qrcode))
  } else if (form.type === 'barcode') {
    form.barcode = JSON.parse(JSON.stringify(initialData.barcode))
  } else if (form.type === 'artcode') {
    form.artcode = JSON.parse(JSON.stringify(initialData.artcode))
  }
}
</script>

<style lang="less" scoped>
.page-qrcode {
  .form-wrapper {
    :deep(.el-textarea__inner) {
      height: 100px;
    }
  }
  .show-wrapper {
    margin: 10px 0 0 100px;
    .show-box {
      position: relative;
      &.qrcode {
        width: 250px;
        height: 250px;
        img {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
        }
      }
      &.barcode img {
        height: 200px;
      }
      &.artcode {
        width: 250px;
        .box-content {
          width: 100%;
        }
        :deep(img) {
          width: 100% !important;
          height: auto !important;
        }
      }
      .box-options {
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 0;
        transform: translateY(100%);
      }
      .download-btn {
        height: 40px;
        padding: 0 10px;
        position: relative;
        left: 10px;
      }
    }
  }
}
</style>