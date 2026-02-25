import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 主题 Store
 * 管理应用的主题模式（亮色/暗黑）
 */
export const useThemeStore = defineStore('theme', () => {
  // 主题模式：'light' | 'dark'
  const isDark = ref(false)

  // 从本地存储读取主题设置
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 检测系统偏好
      setTheme(true)
      return
      // isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    // 保存到本地存储
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  // 设置主题
  const setTheme = (dark: boolean) => {
    isDark.value = dark
    applyTheme()
  }

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // 只在用户没有手动设置主题时跟随系统
      if (!localStorage.getItem('theme')) {
        isDark.value = e.matches
        applyTheme()
      }
    })
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme,
  }
})
