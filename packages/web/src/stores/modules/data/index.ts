import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useJizhangRecordStore } from '@/stores/modules/jizhang/record'
import { formulas } from '@/config/formula'
import { useTimerStore } from '@/stores/modules/global/timer'
import { useConfigStore } from '@/stores/modules/config'
import { round } from 'lodash-es'

const useDataStore = defineStore(
  'data',
  () => {
    const recordStore = useJizhangRecordStore()
    const timerStore = useTimerStore()
    const configStore = useConfigStore()

    /** 计算点卡消耗 */
    const dkxh = computed(() => {
      return formulas['jsdkxh'].exec(timerStore.elapsedTime)
    })
    /** 计算游戏币消耗 */
    const dkyxbxh = computed(() => {
      return formulas['jsdkyxbxh'].exec(timerStore.elapsedTime)
    })

    // 现金收益
    const money = ref(0)

    /** 计算总收益 */
    const totalIncome = computed(() => {
      return recordStore.totalPrice + money.value
    })

    /** 换算人民币 */
    const totalIncomeRmb = computed(() => {
      return round((totalIncome.value / 3000) * configStore.getConfig<number>('jizhang.cbgjj'), 1)
    })

    /** 计算净收益 */
    const netIncome = computed(() => {
      return totalIncome.value - dkyxbxh.value
    })

    /** 换算人民币 */
    const netIncomeRmb = computed(() => {
      return round((netIncome.value / 3000) * configStore.getConfig<number>('jizhang.cbgjj'), 1)
    })

    return {
      dkxh,
      dkyxbxh,
      money,
      totalIncome,
      totalIncomeRmb,
      netIncome,
      netIncomeRmb,
    }
  },
  {
    persist: true,
  },
)

export { useDataStore }
