import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { uniqueId } from 'lodash-es'
import { Game } from '@/types/game'
import dayjs from 'dayjs'

export const useJizhangRecordStore = defineStore(
  'jizhangRecord',
  () => {
    // 记录列表
    const recordList = ref<Game.Record[]>([])

    /** 当前需要高亮并滚动到的记录 ID（添加后由表格消费并清除） */
    const highlightedRecordId = ref<string | null>(null)

    const setHighlightedRecordId = (id: string | null) => {
      highlightedRecordId.value = id
    }

    // 计算总金额
    const totalPrice = computed(() => {
      return recordList.value.reduce((sum, record) => sum + record.price, 0)
    })

    // 计算记录数量
    const recordCount = computed(() => recordList.value.length)

    const generateId = (): string => {
      return uniqueId('record_' + Date.now() + '_')
    }

    /**
     * 添加记录
     * @param record 记录对象
     */
    const addRecord = (record: Game.GameItem): Game.Record => {
      const newRecord: Game.Record = {
        id: generateId(),
        name: record.name,
        price: record.price || 0,
        date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }
      recordList.value.unshift(newRecord)
      return newRecord
    }

    /**
     * 删除记录
     * @param id 记录 ID
     * @returns 是否删除成功
     */
    const deleteRecord = (id: string): boolean => {
      const index = recordList.value.findIndex((item) => item.id === id)
      if (index > -1) {
        recordList.value.splice(index, 1)
        return true
      }
      return false
    }

    /**
     * 清空所有记录
     */
    const clearRecords = () => {
      recordList.value = []
    }

    /**
     * 获取记录列表
     */
    const getRecords = (): Game.Record[] => {
      return recordList.value
    }

    /**
     * 根据 ID 查找记录
     * @param id 记录 ID
     */
    const findRecordById = (id: string): Game.Record | undefined => {
      return recordList.value.find((item) => item.id === id)
    }

    /**
     * 更新记录
     * @param id 记录 ID
     * @param updates 要更新的字段
     * @returns 是否更新成功
     */
    const updateRecord = (id: string, updates: Partial<Omit<Game.Record, 'id'>>): boolean => {
      const record = findRecordById(id)
      if (record) {
        Object.assign(record, updates)
        return true
      }
      return false
    }

    return {
      recordList,
      highlightedRecordId,
      setHighlightedRecordId,
      totalPrice,
      recordCount,
      addRecord,
      deleteRecord,
      clearRecords,
      getRecords,
      findRecordById,
      updateRecord,
    }
  },
  {
    persist: {
      pick: ['recordList'],
    },
  },
)
