import Home from '@/pages/HomePage.vue'
import Plugins from '@/pages/PluginsPage.vue'
import Triangle from '@/pages/TrianglePage.vue'

const routes = [
  {
    path: '/',
    component: Home,
    meta: {
      title: '网站导航'
    }
  },
  {
    path: '/plugins',
    component: Plugins,
    meta: {
      title: '插件导航'
    }
  },
  {
    path: '/triangle',
    component: Triangle,
    meta: {
      title: 'CSS三角形生成器'
    }
  }
]

export default routes