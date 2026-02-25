import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from '@vue/eslint-config-prettier'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  // 禁用与 Prettier 冲突的 ESLint 规则
  prettierConfig,
  // 启用 Prettier 作为 ESLint 规则
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn', // 使用 warn 而不是 error，因为格式化不是关键问题
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
