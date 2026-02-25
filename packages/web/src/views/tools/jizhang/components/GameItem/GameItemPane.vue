<template>
  <div class="game-item-pane">
    <div class="game-item-pane__grid" :style="gridStyle">
      <GameItem
        v-for="(item, index) in items"
        :key="item?.id || index"
        :data="item"
        class="game-item-pane__item"
        @click="handleClick"
        @remove="handleRemove"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入 Game namespace 和 GameItem 组件
import { Game } from '@/types/game'
import { computed } from 'vue'
import GameItem from './GameItem.vue'
import { useJizhangRecordStore } from '@/stores/modules/jizhang/record'

const recordStore = useJizhangRecordStore()

// 定义 props：接收物品列表
interface Props {
  items?: Game.GameItem[]
  // 网格列数，默认为 8 列
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  columns: 6,
})

// 计算网格样式
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
}))

const handleClick = (item: Game.GameItem) => {
  const newRecord = recordStore.addRecord(item)
  recordStore.setHighlightedRecordId(newRecord.id)
}

const handleRemove = () => {
  const first = recordStore.recordList[0]
  if (first) {
    recordStore.deleteRecord(first.id)
  }
}
</script>

<style lang="stylus" scoped>
.game-item-pane {
  width: 100%;
  padding: 16px;
}

.game-item-pane__grid {
  display: grid;
  gap: 8px;
  width: 100%;
}

.game-item-pane__item {
  aspect-ratio: 1;
  min-height: 80px;
}
</style>
