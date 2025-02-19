import { createApp, createVNode } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import hljs from 'highlight.js/lib/core'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import less from 'highlight.js/lib/languages/less'
import scss from 'highlight.js/lib/languages/scss'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import 'highlight.js/styles/a11y-light.css'
import 'highlight.js/lib/common'

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

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)
hljs.registerLanguage('less', less)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('markdown', markdown)

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
