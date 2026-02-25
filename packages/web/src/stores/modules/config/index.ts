import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { AppConfig } from '@/types/config'
import { defaultConfig } from '@/config/default'

/**
 * 配置管理 Store
 * 作为网站所有配置的统一入口
 */
export const useConfigStore = defineStore(
  'config',
  () => {
    // 使用 reactive 确保嵌套对象的响应式
    const config = reactive<AppConfig>({ ...defaultConfig })

    /**
     * 根据路径获取配置值
     * @param path 配置路径，支持点号分隔的嵌套路径，如 'jizhang.columns'
     * @returns 配置值
     * @example
     * ```ts
     * const columns = getConfig<number>('jizhang.columns')
     * ```
     */
    const getConfig = <T = unknown>(path: string): T => {
      const keys = path.split('.')
      let value: any = config

      for (const key of keys) {
        if (value === null || value === undefined) {
          return undefined as T
        }
        value = value[key]
      }

      return value as T
    }

    /**
     * 根据路径设置配置值
     * @param path 配置路径，支持点号分隔的嵌套路径
     * @param value 要设置的值
     * @example
     * ```ts
     * setConfig('jizhang.columns', 8)
     * ```
     */
    const setConfig = <T = unknown>(path: string, value: T): void => {
      const keys = path.split('.')
      const lastKey = keys.pop()!

      if (!lastKey) {
        console.warn(`Invalid config path: ${path}`)
        return
      }

      let target: any = config

      // 遍历路径，确保所有中间对象存在
      for (const key of keys) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {}
        }
        target = target[key]
      }

      // 设置值
      target[lastKey] = value
    }

    /**
     * 批量更新配置
     * @param partial 部分配置对象
     * @example
     * ```ts
     * updateConfig({
     *   jizhang: {
     *     columns: 8
     *   }
     * })
     * ```
     */
    const updateConfig = (partial: Partial<AppConfig>): void => {
      Object.assign(config, partial)
    }

    /**
     * 获取所有配置
     * @returns 完整的配置对象
     */
    const getAllConfig = (): AppConfig => {
      return { ...config }
    }

    /**
     * 重置配置
     * @param path 可选，指定要重置的配置路径。如果不提供，则重置所有配置
     * @example
     * ```ts
     * resetConfig() // 重置所有配置
     * resetConfig('jizhang') // 重置记账配置
     * resetConfig('jizhang.columns') // 重置记账列数
     * ```
     */
    const resetConfig = (path?: string): void => {
      if (!path) {
        // 重置所有配置
        Object.assign(config, defaultConfig)
        return
      }

      const keys = path.split('.')
      const lastKey = keys.pop()!

      if (!lastKey) {
        console.warn(`Invalid config path: ${path}`)
        return
      }

      let target: any = config

      // 遍历路径
      for (const key of keys) {
        if (!target[key]) {
          return // 路径不存在，无需重置
        }
        target = target[key]
      }

      // 获取默认值
      let defaultValue: any = defaultConfig
      for (const key of keys) {
        defaultValue = defaultValue[key]
      }

      // 重置值
      if (defaultValue && typeof defaultValue === 'object' && lastKey in defaultValue) {
        target[lastKey] = defaultValue[lastKey]
      } else {
        // 如果路径指向整个对象，重置整个对象
        const defaultObj: any = defaultConfig
        let defaultTarget = defaultObj
        for (const key of keys) {
          defaultTarget = defaultTarget[key]
        }
        Object.assign(target, defaultTarget)
      }
    }

    return {
      config,
      getConfig,
      setConfig,
      updateConfig,
      getAllConfig,
      resetConfig,
    }
  },
  {
    persist: true, // 启用持久化
  },
)
