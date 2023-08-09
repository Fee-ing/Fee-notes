<template>
  <el-menu
    class="app-nav"
    :default-active="activeNav"
    :default-openeds="['2']"
  >
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
            @click="handleClick(child.path, `${row + 1}-${col + 1}`)"
          >{{ child.title }}</el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
      <el-menu-item v-else :index="`${row + 1}`" @click="handleClick(item.path, `${row + 1}`)">
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
    title: '小工具',
    icon: 'SetUp',
    children: [
      {
        title: 'CSS三角形生成器',
        path: '/triangle'
      },
      {
        title: 'PS投影转CSS3',
        path: '/shadow'
      }
    ]
  }
]

const activeNav = ref('1')
const route = useRoute()
const queryActive = computed(() => (route.query.a || '1'))
watch(queryActive, newVal => activeNav.value = newVal)

const router = useRouter()
const handleClick = (path, index) => {
  router.push({ path, query: { a: index } })
  activeNav.value = index
}
</script>

<style lang="less" scoped>
.app-nav {
  width: 200px;
  height: 100%;
}
</style>
