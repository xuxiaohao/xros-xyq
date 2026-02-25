import { fileURLToPath, URL } from 'node:url'

import { ConfigEnv, defineConfig, loadEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createHtmlPlugin } from 'vite-plugin-html'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 加载环境变量（从当前目录加载 .env 文件）
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  // 从环境变量中获取标题，默认为 "X 西游助手"
  const title = env.VITE_TITLE || 'X 西游助手'

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      // HTML 模板变量替换插件
      createHtmlPlugin({
        inject: {
          data: {
            title,
          },
        },
      }),
      // Element Plus 按需导入 + VueUse 自动导入
      AutoImport({
        imports: [
          'vue',
          '@vueuse/core', // VueUse 组合式函数自动导入
        ],
        resolvers: [ElementPlusResolver()],
        dts: true, // 生成类型声明文件
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: true, // 生成类型声明文件
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // 开发服务器端口
      port: 3000,
      // 启动时自动打开浏览器
      open: true,
      // 允许外部访问
      host: true,
    },
    build: {
      // 小于 5KB 的资源会被内联为 base64
      assetsInlineLimit: 5120, // 5KB = 5 * 1024 bytes
    },
  }
})
