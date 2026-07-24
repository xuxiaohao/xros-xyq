import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import type { Plugin } from 'vite'
import viteConfig from './vite.config'

// vite.config.ts returns a function, call it
const resolvedViteConfig =
  typeof viteConfig === 'function' ? viteConfig({ mode: 'test', command: 'build' }) : viteConfig

// Remove ONLY the Element Plus auto-import resolvers (they inject .css imports)
const filteredPlugins = (resolvedViteConfig.plugins || []).map((p: any) => {
  if (p?.name === 'unplugin-auto-import') {
    // Clone the plugin but strip ElementPlusResolver
    const clone = Array.isArray(p) ? [...p] : [{ ...p }]
    for (const item of clone) {
      if (Array.isArray(item?.__options?.resolvers)) {
        item.__options = { ...item.__options }
        item.__options.resolvers = item.__options.resolvers.filter(
          (r: any) => !String(r?.name || '').toLowerCase().includes('element'),
        )
      }
    }
    return clone.length === 1 ? clone[0] : clone
  }
  if (p?.name === 'unplugin-vue-components') {
    const clone = Array.isArray(p) ? [...p] : [{ ...p }]
    for (const item of clone) {
      if (Array.isArray(item?.__options?.resolvers)) {
        item.__options = { ...item.__options }
        item.__options.resolvers = item.__options.resolvers.filter(
          (r: any) => !String(r?.name || r?.resolver || '').toLowerCase().includes('element'),
        )
      }
    }
    return clone.length === 1 ? clone[0] : clone
  }
  return p
})

export default mergeConfig(
  { ...resolvedViteConfig, plugins: filteredPlugins },
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
