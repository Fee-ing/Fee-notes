<template>
  <el-menu
    class="app-nav"
    :default-active="activeNav"
    :default-openeds="['3', '4']"
  >
    <div class="avatar"></div>
    <template v-for="(item, row) in navConfig" :key="row">
      <el-sub-menu v-if="item.children" :index="`${row + 1}`">
        <template #title>
          <el-icon>
            <component :is="item.icon"></component>
          </el-icon>
          <span>{{ item.title }}</span>
        </template>
        <el-menu-item-group>
          <el-menu-item
            v-for="(child, col) in item.children"
            :key="`${row + 1}-${col + 1}`"
            :index="`${row + 1}-${col + 1}`"
            @click="handleClick(child, `${row + 1}-${col + 1}`)"
          >{{ child.title }}</el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
      <el-menu-item v-else :index="`${row + 1}`" @click="handleClick(item, `${row + 1}`)">
        <el-icon>
          <component :is="item.icon"></component>
        </el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const navConfig = [
  {
    title: '影视资源',
    icon: 'Film',
    path: '/movie'
  },
  {
    title: '网站导航',
    icon: 'Link',
    path: '/'
  },
  {
    title: '插件导航',
    icon: 'Key',
    path: '/plugins'
  },
  {
    title: '常用工具',
    icon: 'SetUp',
    children: [
      {
        title: '代码格式化',
        path: '/beautify'
      },
      {
        title: '二维码生成',
        path: '/qrcode'
      },
      {
        title: '二维码解析',
        path: '/parse-qrcode'
      },
      {
        title: '正则表达式',
        path: '/regexp'
      },
    ]
  },
  {
    title: '其他工具',
    icon: 'FolderOpened',
    children: [
      {
        title: '转换工具',
        path: '/transfer'
      },
      {
        title: 'CSS三角形生成器',
        path: '/triangle'
      },
      {
        title: 'PS投影转CSS3',
        path: '/shadow'
      },
    ]
  },
]

const activeNav = ref('1')
const route = useRoute()
const queryActive = computed(() => (route.query.a || '1'))
watch(queryActive, newVal => activeNav.value = newVal)

const router = useRouter()
const handleClick = (opts, index) => {
  const { url, path } = opts
  if (url) {
    window.open(url)
  } else {
    router.push({ path, query: { a: index } })
    activeNav.value = index
  }
}
</script>

<style lang="less" scoped>
.app-nav {
  width: 200px;
  height: 100%;
  :deep(.el-menu-item) {
    font-size: 15px;
  }
  :deep(.el-sub-menu__title) {
    font-size: 15px;
  }
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin: 30px auto 20px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url(../assets/avatar.jpg);
  }
}
</style>
