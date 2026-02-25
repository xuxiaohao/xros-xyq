// 导出 Game namespace，使其可以在其他文件中通过 Game.xxx 访问
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Game {
  // 导出枚举类型
  export enum GameItemType {
    FIXED = 'fixed',
    DYNAMIC = 'dynamic',
  }
  /** 游戏物品信息 */
  export interface GameItem {
    id: number
    name: string
    price?: number
    src?: string
    type: GameItemType
    children?: GameSubItem[]
  }

  /** 游戏物品子项信息 */
  export interface GameSubItem {
    name: string
    price: number
    [key: string]: unknown
  }

  /** 游戏物品记录信息 */
  export interface Record {
    id: string
    name: string
    price: number
    date: string
  }
}
