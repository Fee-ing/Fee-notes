<template>
  <div class="page-wrapper page-movie" id="page-movie">
    <iframe
      class="movie-iframe"
      :class="[loaded ? 'show' : '']"
      id="movie-iframe"
      src="https://fee-ing.github.io/Fee-web/#/"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script setup>
import { onActivated, ref } from 'vue'
import { ElLoading } from 'element-plus'

const loaded = ref(false)

onActivated(() => {
  loaded.value = false
  const loading = ElLoading.service({
    lock: true,
    text: '加载中~',
    background: 'rgba(255, 255, 255, 0.7)',
    target: document.getElementById('page-movie')
  })
  document.getElementById('movie-iframe').onload = () => {
    loaded.value = true
    loading.close()
  }
})
</script>

<style lang="less" scoped>
.page-movie {
  padding: 0;
  .movie-iframe {
    height: 100%;
    width: 100%;
    opacity: 0;
    &.show {
      opacity: 1;
    }
  }
}
</style>