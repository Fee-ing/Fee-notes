<template>
  <div class="app-wrapper flex over-h">
    <Nav></Nav>
    <router-view class="flex-1 over-h" v-slot="{ Component }">
      <keep-alive>
<<<<<<< HEAD
=======
        <!-- <component v-if="$route.meta.keepAlive" :is="Component" /> -->
>>>>>>> d1be8d599d61346e86a5012a973b11458da097bc
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <!-- <router-view v-if="!$route.meta.keepAlive" class="flex-1 over-h" ></router-view> -->
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