<template>
  <el-drawer
    :model-value="modelValue"
    title="设置"
    direction="rtl"
    size="420px"
    class="settings-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="settings-drawer__body">
      <el-form label-position="top">
        <el-divider content-position="left">记账</el-divider>
        <el-form-item label="物品列表列数">
          <el-input-number
            v-model="configStore.config.jizhang.columns"
            :min="2"
            :max="12"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="点卡比例">
          <el-input-number
            v-model="configStore.config.jizhang.dkbl"
            :min="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="藏宝阁金价（万/元）">
          <el-input-number
            v-model="configStore.config.jizhang.cbgjj"
            :min="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="在线号数">
          <el-input-number
            v-model="configStore.config.jizhang.zxhs"
            :min="1"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <el-divider content-position="left">物品列表</el-divider>
      <div class="items-section">
        <div class="items-section__toolbar">
          <el-input
            v-model="itemsSearchKeyword"
            placeholder="按名称或类型搜索"
            clearable
            style="flex: 1; margin-right: 8px"
          />
          <el-button type="primary" @click="openItemEdit(null)">添加物品</el-button>
        </div>
        <el-table :data="filteredItems" max-height="240" class="items-table" size="small">
          <el-table-column prop="name" label="名称" min-width="80" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="72" align="center">
            <template #default="{ row }">
              <el-tag :type="row.type === 'dynamic' ? 'info' : 'success'" size="small">
                {{ row.type === 'dynamic' ? '动态' : '固定' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="子项数" width="64" align="center">
            <template #default="{ row }">
              {{ row.children?.length ?? 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openItemEdit(row)">
                编辑
              </el-button>
              <el-popconfirm
                :title="`确定删除「${row.name}」吗？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleDeleteItem(row)"
              >
                <template #reference>
                  <el-button type="danger" link size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="settings-drawer__footer">
        <el-button type="default" @click="configStore.resetConfig()">重置为默认</el-button>
      </div>
    </div>

    <ItemEditDialog v-model="itemEditVisible" :item="editingItem" @save="handleItemSave" />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useConfigStore } from '@/stores/modules/config'
import { Game } from '@/types/game'
import ItemEditDialog from './ItemEditDialog.vue'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const configStore = useConfigStore()
const itemsSearchKeyword = ref('')
const itemEditVisible = ref(false)
const editingItem = ref<Game.GameItem | null>(null)

const filteredItems = computed(() => {
  const list = configStore.config.items ?? []
  const kw = itemsSearchKeyword.value.trim().toLowerCase()
  if (!kw) return list
  return list.filter(
    (item) => item.name.toLowerCase().includes(kw) || item.type.toLowerCase().includes(kw),
  )
})

const openItemEdit = (row: Game.GameItem | null) => {
  editingItem.value = row ? { ...row, children: row.children?.map((c) => ({ ...c })) ?? [] } : null
  itemEditVisible.value = true
}

const handleItemSave = (payload: Game.GameItem) => {
  const items = configStore.config.items
  if (!payload.id) {
    const maxId = items.length ? Math.max(...items.map((i) => i.id), 0) : 0
    items.push({ ...payload, id: maxId + 1 })
  } else {
    const idx = items.findIndex((i) => i.id === payload.id)
    if (idx !== -1) items.splice(idx, 1, { ...payload })
  }
}

const handleDeleteItem = (row: Game.GameItem) => {
  const items = configStore.config.items
  const idx = items.findIndex((i) => i.id === row.id)
  if (idx !== -1) items.splice(idx, 1)
}
</script>

<style lang="stylus" scoped>
.settings-drawer__body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.items-section {
  margin-bottom: 16px;
}

.items-section__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.items-table {
  font-size: 12px;
}

.settings-drawer__footer {
  margin-top: auto;
  padding-top: 16px;
}
</style>
