<template>
  <div class="page-wrapper page-plugins flex flex-wrap">
    <el-card
      class="page-card"
      v-for="(item, index) in webList"
      :key="index"
    >
      <template #header>
        <div class="card-header flex-v">
          <div class="flex-1">{{ item.title }}</div>
          <el-link icon="ArrowRight" :underline="false" :href="item.link" target="_blank"></el-link>
        </div>
      </template>
      <div>{{ item.description }}</div>
    </el-card>
  </div>
</template>

<script setup>
const webList = [
  {
    title: 'SheetJS',
    link: 'https://github.com/SheetJS/sheetjs',
    description: '操作Excel以及类似的二维表的插件'
  },
  {
    title: 'ClipboardJS',
    link: 'https://github.com/zenorocha/clipboard.js',
    description: '复制内容到剪贴板的插件'
  },
  {
    title: 'js-cookie',
    link: 'https://github.com/js-cookie/js-cookie',
    description: '用于处理 Cookie 的简单、轻量级的 JavaScript API'
  },
  {
    title: 'Html2canvas',
    link: 'https://github.com/niklasvh/html2canvas',
    description: '屏幕截图插件'
  },
  {
    title: 'dom-to-image',
    link: 'https://github.com/tsayen/dom-to-image',
    description: '将任意 DOM 节点转换为用 JavaScript 编写的矢量 （SVG） 或光栅（PNG 或 JPEG）图像'
  },
  {
    title: 'SortableJS',
    link: 'https://github.com/SortableJS/Sortable',
    description: '可重新排序的拖放列表的 JavaScript 库'
  },
  {
    title: 'Vue.Draggable',
    link: 'https://github.com/SortableJS/Vue.Draggable',
    description: '基于Sortable.js实现的vue拖拽插件'
  },
  {
    title: 'MoveableJS',
    link: 'https://github.com/daybrush/moveable',
    description: '可拖动的、可调整大小的、可缩放的、可旋转的、可弯曲的、可收缩的、可分组的、可对齐的一个插件'
  },
  {
    title: 'Painter',
    link: 'https://github.com/Kujiale-Mobile/Painter',
    description: '小程序绘制图片的插件'
  },
  {
    title: 'QRCodeJS',
    link: 'https://github.com/davidshimjs/qrcodejs',
    description: '生成二维码'
  },
  {
    title: 'QRCodeStyling',
    link: 'https://github.com/kozakdenys/qr-code-styling',
    description: '风格化二维码'
  },
  {
    title: 'ArtQRCode',
    link: 'https://github.com/252860883/ArtQRCode',
    description: '艺术二维码'
  },
  {
    title: 'JsBarcode',
    link: 'https://github.com/lindell/JsBarcode',
    description: '生成条形码'
  },
  {
    title: 'HighlightJS',
    link: 'https://github.com/highlightjs/highlight.js',
    description: '语法高亮插件'
  },
  {
    title: 'Administrative-divisions-of-China',
    link: 'https://github.com/modood/Administrative-divisions-of-China',
    description: '中国省市区插件'
  },
  {
    title: 'DayJS',
    link: 'https://github.com/iamkun/dayjs',
    description: '极简的时间日期库'
  },
  {
    title: 'DexieJS',
    link: 'https://github.com/dexie/Dexie.js',
    description: 'IndexedDB的简约包装器'
  },
  {
    title: 'ChromaJS',
    link: 'https://github.com/gka/chroma.js',
    description: '轻量的颜色转换库'
  },
  {
    title: 'Heic2anyJS',
    link: 'https://github.com/alexcorvi/heic2any',
    description: '将 HEIC/HEIF 图像文件转换为 JPEG、PNG 或 GIF'
  },
  {
    title: 'TrackingJS',
    link: 'https://github.com/eduardolundgren/tracking.js',
    description: '人脸识别和图像识别'
  },
  {
    title: 'UuidJS',
    link: 'https://github.com/uuidjs/uuid',
    description: '生成随机的UUID'
  },
  {
    title: 'Console-ban',
    link: 'https://github.com/fz6m/console-ban',
    description: '禁止F12 / 审查开启控制台，保护站点资源、减少爬虫和攻击的轻量方案，支持重定向、重写、自定义多种策略'
  },
  {
    title: 'Vue-web-extension',
    link: 'https://github.com/Kocal/vue-web-extension',
    description: '使用Vue开发浏览器插件'
  },
  {
    title: 'Chrome插件(扩展)开发博客',
    link: 'https://www.bookstack.cn/read/chrome-plugin-develop',
    description: 'Chrome插件(扩展)开发全攻略'
  },
  {
    title: 'Vutron',
    link: 'https://github.com/jooy2/vutron',
    description: '基于Vue3、用于开发Electron跨平台桌面应用的预配置模板'
  },
  {
    title: 'FullPageJS',
    link: 'https://github.com/alvarotrigo/fullPage.js',
    description: '用于创建全屏滚动网站，并且可以在网站的各个部分内添加横向滑块'
  },
  {
    title: 'TypedJS',
    link: 'https://github.com/mattboldt/typed.js',
    description: '专门用于创建打字动画效果的 JavaScript 库'
  },
]
</script>

<style lang="less" scoped>
.page-plugins {
  padding: 10px;
  align-content: flex-start;
}
</style>