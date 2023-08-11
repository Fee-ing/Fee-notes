<template>
  <div class="app-wrapper flex over-h">
    <Nav></Nav>
    <router-view class="flex-1 over-h" v-slot="{ Component }">
      <keep-alive>
        <component v-if="$route.meta.keepAlive" :is="Component" />
      </keep-alive>
    </router-view>
    <router-view v-if="!$route.meta.keepAlive" class="flex-1 over-h" ></router-view>
  </div>
</template>

<script>
import Nav from './components/NavComp.vue'

export default {
  name: 'App',
  components: {
    Nav
  }
}
</script>

<style lang="less" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
}
</style>