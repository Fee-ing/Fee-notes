<template>
  <div class="page-wrapper page-home flex flex-wrap">
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
    title: 'Aconvert',
    link: 'https://www.aconvert.com/',
    description: '在线转换各类PDF，文档，电子书，图像，图标，视频，音频和压缩文件'
  },
  {
    title: 'TinyPNG',
    link: 'https://tinypng.com/',
    description: '在线智能压缩WebP、PNG和JPEG图片'
  },
  {
    title: 'Waifu2x',
    link: 'https://waifu2x.udp.jp/',
    description: '在线无损放大图片'
  },
  {
    title: 'Transfonter',
    link: 'https://transfonter.org/',
    description: '将任何TTF、OTF、WOFF、WOFF2或SVG字体在线转换为css @font-face格式'
  },
  {
    title: 'Color Hunt',
    link: 'https://www.colorhunt.co/',
    description: '推荐最佳的色系搭配组合'
  },
  {
    title: 'React Login Pages',
    link: 'https://uiwjs.github.io/react-login-page/',
    description: '适用于React、提供灵活API的登录页面组件'
  },
  {
    title: 'UIverse',
    link: 'https://uiverse.io/all',
    description: '炫酷的UI组件'
  },
  {
    title: 'Tailspark',
    link: 'https://tailspark.co/',
    description: '300+免费的CSS组件和模板'
  },
  {
    title: 'Loading',
    link: 'https://loading.io/',
    description: '炫酷丰富的loading图标'
  },
  {
    title: 'Cubic-bezier',
    link: 'https://cubic-bezier.com/',
    description: '贝塞尔曲线'
  },
  {
    title: 'Get Emoji',
    link: 'https://getemoji.com/',
    description: 'Emoji大全'
  },
  {
    title: 'HelloGitHub',
    link: 'https://hellogithub.com/',
    description: '一个发现和分享有趣、入门级开源项目的平台'
  }
]

// const handleOpen = (href) => {
//   window.open(href, '_blank')
// }
</script>

<style lang="less" scoped>
.page-home {
  padding: 10px;
  align-content: flex-start;
}
</style>