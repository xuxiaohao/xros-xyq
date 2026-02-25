import type { AppConfig } from '@/types/config'
import items from './items.json'
import type { Game } from '@/types/game'

/**
 * 默认配置
 * 所有配置项的默认值
 */
export const defaultConfig: AppConfig = {
  theme: {
    mode: 'dark',
  },
  jizhang: {
    columns: 6,
    dkbl: 13500,
    cbgjj: 210, // 3000W = 240RMB
    zxhs: 5,
  },
  general: {
    language: 'zh-CN',
  },
  items: items as Game.GameItem[],
}
