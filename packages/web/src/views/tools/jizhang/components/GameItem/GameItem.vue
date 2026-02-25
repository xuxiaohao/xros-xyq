<template>
  <ElPopover
    v-if="data"
    placement="right"
    :width="popoverWidth"
    trigger="hover"
    :show-after="1000"
    :hide-after="150"
    transition=""
    popper-class="game-item-popover"
  >
    <template #reference>
      <div
        class="game-item"
        :class="{ 'game-item--empty': !data }"
        @click="clickHandler()"
        @contextmenu.prevent="() => contextMenuHandler()"
      >
        <div v-if="data" class="game-item__content">
          <!-- 物品图片 -->
          <img v-if="imageSrc" :src="imageSrc" :alt="data.name" class="game-item__image" />
          <div v-else class="game-item__placeholder">无图</div>
        </div>
      </div>
    </template>
    <!-- Popover 内容 -->
    <div class="game-item-popover-content">
      <!-- 主物品信息 -->
      <div class="game-item-popover-header">
        <div class="game-item-popover-title">{{ data.name }}</div>
      </div>
      <div
        class="game-item-popover-body"
        :class="{
          'game-item-popover-body--with-children': data.children && data.children.length > 0,
        }"
      >
        <!-- 左侧：物品图片 -->
        <div class="game-item-popover-image">
          <img v-if="imageSrc" :src="imageSrc" :alt="data.name" class="game-item-popover-img" />
          <div v-else class="game-item-popover-placeholder">无图</div>
        </div>
        <!-- 右侧：子项列表 -->
        <div v-if="data.children && data.children.length > 0" class="game-item-popover-children">
          <div
            v-for="(child, index) in data.children"
            :key="index"
            class="game-item-popover-child"
            @click="clickHandler(child)"
            @contextmenu.prevent="contextMenuHandler(child)"
          >
            <span class="game-item-popover-child-name">{{ child.name }}</span>
            <span class="game-item-popover-child-price">{{ child.price }}</span>
          </div>
        </div>
      </div>
    </div>
  </ElPopover>
  <div v-else class="game-item game-item--empty" @contextmenu.prevent>
    <div class="game-item__content"></div>
  </div>
</template>

<script setup lang="ts">
// 导入 Game namespace
import { Game } from '@/types/game'
import { computed } from 'vue'
import { omit } from 'lodash-es'
import { useJizhangRecordStore } from '@/stores/modules/jizhang/record'

const props = withDefaults(
  defineProps<{
    data?: Game.GameItem
  }>(),
  {
    data: undefined,
  },
)

const emit = defineEmits<{
  (e: 'click', item: Game.GameItem): void
  (e: 'remove'): void
}>()

const recordStore = useJizhangRecordStore()

const clickHandler = (item?: Game.GameSubItem) => {
  if (props.data) {
    // 如果没有 item, 判断 props.data 是否有子项，如果有, 将 item 设置为第一个子项
    if (!item && props.data.children && props.data.children.length > 0) {
      item = props.data.children[0]
    }

    emit('click', {
      ...omit(props.data, 'children'),
      name: props.data.name + (item ? `[${item?.name}]` : ''),
      price: item?.price || props.data.price || 0,
    })
  }
}

/** 右键：若记录中第一项与本物品类型相同则发出 remove 事件，由父组件处理。child 为 popover 子项时表示该子项对应的记录名 */
const contextMenuHandler = (child?: Game.GameSubItem) => {
  if (!props.data) return
  const first = recordStore.recordList[0]
  if (!first) return
  const recordName = child ? `${props.data.name}[${child.name}]` : props.data.name
  const sameType =
    first.name === recordName || (!child && first.name.startsWith(props.data.name + '['))
  if (sameType) {
    emit('remove')
  }
}

// 计算图片路径，如果 src 存在则使用，否则尝试从 assets 文件夹加载
const imageSrc = computed(() => {
  if (!props.data?.src) return null
  // 如果 src 是完整 URL，直接使用
  if (props.data.src.startsWith('http') || props.data.src.startsWith('/')) {
    return props.data.src
  }
  // 否则尝试从 assets 加载
  try {
    return new URL(`/src/assets/images/items/${props.data.src}`, import.meta.url).href
  } catch {
    return props.data.src
  }
})

// 计算 popover 宽度：如果有 children，宽度更大
const popoverWidth = computed(() => {
  if (props.data?.children && props.data.children.length > 0) {
    return 300
  }
  return 200
})
</script>

<style lang="stylus" scoped>
.game-item {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #2b2b2b;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    border-color: #ffd700;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    transform: translateY(-2px);
  }

  &--empty {
    background: #1a1a1a;
    border-color: #333;
    cursor: default;

    &:hover {
      border-color: #333;
      box-shadow: none;
      transform: none;
    }
  }
}

.game-item__content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.game-item__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-item__placeholder {
  font-size: 12px;
  color: #666;
}

.game-item__name {
  font-size: 12px;
  color: #e0e0e0;
  text-align: center;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.game-item__price {
  font-size: 11px;
  color: #f56c6c;
  font-weight: 500;
}
</style>

<!-- Popover 样式 -->
<style lang="stylus">
.game-item-popover {
  padding: 0 !important;
  transition: none !important;
  animation: none !important;
}

.game-item-popover-content {
  padding: 12px;
  background: #2b2b2b;
  border-radius: 4px;
  max-height: 70vh;
  overflow-y: auto;
}

.game-item-popover-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #404040;
}

.game-item-popover-title {
  font-size: 16px;
  font-weight: 500;
  color: #ffd700;
  text-align: center;
}

.game-item-popover-body {
  display: flex;
  justify-content: center;
  gap: 16px;

  &--with-children {
    justify-content: flex-start;
  }
}

.game-item-popover-image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  background: #1a1a1a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.game-item-popover-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.game-item-popover-placeholder {
  font-size: 14px;
  color: #666;
}

.game-item-popover-children {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.game-item-popover-child {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #1a1a1a;
  border-radius: 2px;
  transition: background 0.2s;

  &:hover {
    background: #252525;
  }
}

.game-item-popover-child-name {
  font-size: 13px;
  color: #fff;
  flex: 1;
}

.game-item-popover-child-price {
  font-size: 13px;
  color: #f56c6c;
  font-weight: 500;
  margin-left: 8px;
}
</style>
