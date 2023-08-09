<template>
  <div class="page-wrapper flex flex-wrap">
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
    title: 'Html2canvas',
    link: 'https://github.com/niklasvh/html2canvas',
    description: '屏幕截图插件'
  },
  {
    title: 'Painter',
    link: 'https://github.com/Kujiale-Mobile/Painter',
    description: '小程序绘制图片的插件'
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
    title: 'ArtQRCode',
    link: 'https://github.com/252860883/ArtQRCode',
    description: '艺术二维码'
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
]
</script>

<style lang="less" scoped>
.page-wrapper {
  padding: 10px;
  align-content: flex-start;
}
</style>