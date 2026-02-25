import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/**
 * 创建并配置 Pinia 实例
 * 注册持久化插件，使 Store 状态可以持久化到 localStorage
 */
export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
