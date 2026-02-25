import type { Game } from './game'

/**
 * 应用配置类型定义
 * 定义所有可配置项的类型
 */

/**
 * 应用配置接口
 */
export interface AppConfig {
  /** 物品列表 */
  items: Game.GameItem[]
  /** 主题配置 */
  theme: {
    /** 主题模式 */
    mode: 'light' | 'dark' | 'auto'
  }
  /** 记账配置 */
  jizhang: {
    /** 物品列表列数 */
    columns: number
    /** 点卡比例 */
    dkbl: number
    /** 藏宝阁金价 */
    cbgjj: number
    /** 在线号数 */
    zxhs: number
  }
  /** 通用配置 */
  general: {
    /** 语言设置 */
    language: string
  }
}
