import Home from '@/pages/HomePage.vue'
import Plugins from '@/pages/PluginsPage.vue'
import Triangle from '@/pages/TrianglePage.vue'
import Shadow from '@/pages/ShadowPage.vue'
import Qrcode from '@/pages/QrcodePage.vue'
import Beautify from '@/pages/BeautifyPage.vue'
import ParseQrcode from '@/pages/ParseQrcode.vue'
import Regexp from '@/pages/RegexpPage.vue'

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
  },
  {
    path: '/shadow',
    component: Shadow,
    meta: {
      title: 'Photoshop投影转CSS3'
    }
  },
  {
    path: '/qrcode',
    component: Qrcode,
    meta: {
      title: '二维码在线生成'
    }
  },
  {
    path: '/beautify',
    component: Beautify,
    meta: {
      title: '代码格式化'
    }
  },
  {
    path: '/parse-qrcode',
    component: ParseQrcode,
    meta: {
      title: '解析二维码',
      keepAlive: true
    }
  },
  {
    path: '/regexp',
    component: Regexp,
    meta: {
      title: '正则表达式'
    }
  }
]

export default routes