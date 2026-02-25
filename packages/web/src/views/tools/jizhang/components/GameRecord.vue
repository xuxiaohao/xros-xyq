<template>
  <div class="game-record">
    <el-card shadow="never" class="game-record-card">
      <template #header>
        <div class="game-record-header">
          <GStatistic />
        </div>
      </template>
      <el-table
        ref="tableRef"
        :data="recordList"
        style="width: 100%"
        :empty-text="'暂无记录'"
        :cell-class-name="getCellClassName"
        :row-class-name="getRowClassName"
        class="game-record-table"
      >
        <!-- <el-table-column type="index" fixed="left" label="ID" width="80" align="center" /> -->
        <el-table-column prop="name" label="物品名称" min-width="120" />
        <el-table-column prop="price" label="价格" width="100" align="right">
          <template #default="{ row }">
            <span class="price-text">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="date"
          label="日期"
          width="80"
          align="center"
          :formatter="formatDate"
        />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { Game } from '@/types/game'
import { useJizhangRecordStore } from '@/stores/modules/jizhang/record'
import dayjs from 'dayjs'
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import type { TableInstance } from 'element-plus'
import GStatistic from './GStatistic/GStatistic.vue'

const recordStore = useJizhangRecordStore()
const { recordList, highlightedRecordId } = storeToRefs(recordStore)

const tableRef = ref<TableInstance>()
const HIGHLIGHT_DURATION = 2000
let highlightTimerId: ReturnType<typeof setTimeout> | null = null

const getRowClassName = ({ row }: { row: Game.Record }) => {
  return highlightedRecordId.value === row.id ? 'row-highlight' : ''
}

watch(highlightedRecordId, async (id) => {
  if (highlightTimerId !== null) {
    clearTimeout(highlightTimerId)
    highlightTimerId = null
  }
  if (!id || !tableRef.value) return
  await nextTick()
  tableRef.value.setScrollTop(0)
  highlightTimerId = setTimeout(() => {
    recordStore.setHighlightedRecordId(null)
    highlightTimerId = null
  }, HIGHLIGHT_DURATION)
})

onBeforeUnmount(() => {
  if (highlightTimerId !== null) {
    clearTimeout(highlightTimerId)
  }
})

const handleDelete = (record: Game.Record) => {
  recordStore.deleteRecord(record.id)
}

const getCellClassName = ({
  row,
  column,
}: {
  row: Game.Record
  column: { property: string }
}): any => {
  if (column.property !== 'price') {
    return
  }
  // 根据价格判断颜色
  let className = ''
  if (row.price > 10000) {
    className = 'row-color-5'
  } else if (row.price > 1000) {
    className = 'row-color-4'
  } else if (row.price > 100) {
    className = 'row-color-3'
  } else if (row.price > 10) {
    className = 'row-color-2'
  } else {
    className = 'row-color-1'
  }
  return className
}

const formatDate = (row: Game.Record) => {
  return dayjs(row.date).format('HH:mm')
}
</script>

<style lang="stylus" scoped>
.game-record {
  width: 100%;
  height: 100%;
  padding: 16px;
}

.game-record-card {
  height: 100%;
  background: #1a1a1a;
  border: 1px solid #404040;

  :deep(.el-card__header) {
    background: #2b2b2b;
    border-bottom: 1px solid #404040;
    padding: 12px 16px;
  }

  :deep(>.el-card__body) {
    padding: 0;
    height: calc(100% - 57px);
    overflow: hidden;
  }
}

.game-record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.game-record-title {
  font-size: 16px;
  font-weight: 500;
  color: #ffd700;
}

.game-record-table {
  height: 100%;
  background: transparent;

  :deep(.el-table__header) {
    background: #1a1a1a;
    color: #e0e0e0;

    th {
      background: #1a1a1a;
      border-bottom: 1px solid #404040;
      color: #e0e0e0;
    }
  }

  :deep(.el-table__body) {
    background: #1a1a1a;
    color: #e0e0e0;

    tr {
      background: #1a1a1a;

      &:hover {
        background: #252525;
      }

      &.el-table__row--striped {
        background: #1f1f1f;

        &:hover {
          background: #252525;
        }
      }

      &.row-highlight {
        background: #2a3a2a !important;
        animation: row-highlight-fade 2s ease-out;
      }
    }

    td {
      border-bottom: 1px solid #404040;
      color: #e0e0e0;
    }
  }

  :deep(.el-table__empty-block) {
    background: #1a1a1a;
    color: #666;
  }
}

.price-text {
  font-weight: 500;
}

@keyframes row-highlight-fade {
  from {
    background: #3a4a3a !important;
  }
  to {
    background: #1a1a1a !important;
  }
}
::v-deep(.row-color-5) {
  color: var(--game-number-5-color) !important;
}
::v-deep(.row-color-4) {
  color: var(--game-number-4-color) !important;
}
::v-deep(.row-color-3) {
  color: var(--game-number-3-color) !important;
}
::v-deep(.row-color-2) {
  color: var(--game-number-2-color) !important;
}
::v-deep(.row-color-1) {
  color: var(--game-number-1-color) !important;
}
</style>
