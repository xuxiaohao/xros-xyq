// 公式配置
import { Formula } from '@/utils/formula/Formula.class'
import { useConfigStore } from '@/stores/modules/config'

const configStore = useConfigStore()

export const formulas = {
  /** 计算点卡消耗 */
  ['jsdkxh']: new Formula({
    name: '计算点卡消耗',
    formula: `ceil(zxsj) * zxhs`,
    description: `在线时间(每10分钟为单位)*角色数量`,
    getFactors({ hours, minutes }: { hours: number; minutes: number; seconds: number }) {
      // 转化为 10 分钟
      return {
        zxsj: (hours * 60 + minutes) / 10,
        // dkbl: configStore.config.jizhang.dkbl,
        zxhs: configStore.config.jizhang.zxhs,
      }
    },
  }),
  /** 计算点卡游戏币消耗 */
  ['jsdkyxbxh']: new Formula({
    name: '计算点卡游戏币消耗',
    formula: `ceil(dkxh * dkbl / 10000)`,
    description: `点卡消耗*点卡比例`,
    getFactors({
      hours,
      minutes,
    }: {
      hours: number
      minutes: number
      seconds: number
    }): Record<string, any> {
      const dkxh = formulas['jsdkxh'].exec({ hours, minutes })
      return {
        dkxh,
        dkbl: configStore.config.jizhang.dkbl,
      }
    },
  }),
}
