<template>
  <div class="app-wrapper flex">
    <Nav></Nav>
    <router-view class="flex-1 over-h" v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <!-- <router-view v-if="!$route.meta.keepAlive" class="flex-1 over-h" ></router-view> -->
  </div>
</template>

<script>
import ClipboardJS from 'clipboard'
import { ElNotification } from 'element-plus'
import Nav from './components/NavComp.vue'

export default {
  name: 'App',
  components: {
    Nav
  },
  mounted () {
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
  }
}
</script>

<style lang="less" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
}
</style>