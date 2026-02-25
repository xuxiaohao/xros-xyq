import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'
import './assets/game.stylus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import { useThemeStore } from './stores/theme'

const app = createApp(App)

app.use(pinia)
app.use(router)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化主题
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
