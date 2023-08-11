import { createApp, createVNode } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'highlight.js/styles/tomorrow-night-blue.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import ElementPlus from 'element-plus'
import * as Icons from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import routes from './router'
import './styles/main.less'
import './styles/flex.less'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  document.title = to.meta?.title || '前端笔记'
})

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(hljsVuePlugin)

const Icon = (props) => {
  const { icon } = props
  return createVNode(Icons[icon])
}
Object.keys(Icons).forEach((key) => {
  app.component(key, Icons[key])
})
app.component('IconComp', Icon)

app.mount('#app')
