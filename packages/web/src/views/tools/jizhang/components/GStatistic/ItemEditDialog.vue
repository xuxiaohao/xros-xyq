<template>
  <el-dialog
    :model-value="modelValue"
    :title="isAdd ? '添加物品' : '编辑物品'"
    width="480px"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="名称" prop="name" required>
        <el-input v-model="form.name" placeholder="物品名称" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="类型" style="width: 100%">
          <el-option label="固定" :value="Game.GameItemType.FIXED" />
          <el-option label="动态" :value="Game.GameItemType.DYNAMIC" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number
          v-model="form.price"
          :min="0"
          controls-position="right"
          style="width: 100%"
          placeholder="选填"
        />
      </el-form-item>
      <el-form-item label="图片路径" prop="src">
        <el-input v-model="form.src" placeholder="如 /images/items/xxx.png" clearable />
      </el-form-item>
      <el-divider content-position="left">子项</el-divider>
      <div class="children-list">
        <div
          v-for="(row, index) in form.children"
          :key="index"
          class="children-row"
        >
          <el-input
            v-model="row.name"
            placeholder="子项名称"
            class="children-name"
          />
          <el-input-number
            v-model="row.price"
            :min="0"
            placeholder="价格"
            controls-position="right"
            class="children-price"
          />
          <el-button type="danger" link :icon="Delete" @click="removeChild(index)" />
        </div>
        <el-button type="primary" link :icon="Plus" @click="addChild">添加子项</el-button>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { Game } from '@/types/game'

const props = defineProps<{
  modelValue: boolean
  item: Game.GameItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: Game.GameItem): void
}>()

const isAdd = computed(() => props.item === null)

const formRef = ref<FormInstance>()
const form = ref<{
  id?: number
  name: string
  type: Game.GameItemType
  price?: number
  src?: string
  children: Game.GameSubItem[]
}>({
  name: '',
  type: Game.GameItemType.FIXED,
  children: [],
})

const resetForm = () => {
  if (props.item) {
    form.value = {
      id: props.item.id,
      name: props.item.name,
      type: props.item.type,
      price: props.item.price,
      src: props.item.src ?? '',
      children: (props.item.children ?? []).map((c) => ({ name: c.name, price: c.price })),
    }
  } else {
    form.value = {
      name: '',
      type: Game.GameItemType.FIXED,
      price: undefined,
      src: '',
      children: [],
    }
  }
}

watch(
  () => [props.modelValue, props.item] as const,
  ([visible]) => {
    if (visible) {
      resetForm()
    }
  },
  { immediate: true },
)

const addChild = () => {
  form.value.children.push({ name: '', price: 0 })
}

const removeChild = (index: number) => {
  form.value.children.splice(index, 1)
}

const handleClose = () => {
  formRef.value?.resetFields()
}

const handleSubmit = () => {
  const name = form.value.name?.trim()
  if (!name) {
    return
  }
  const children = form.value.children.filter(
    (c) => (c.name?.trim() ?? '') !== '' && c.price != null && !Number.isNaN(Number(c.price)),
  )
  const payload: Game.GameItem = {
    id: form.value.id ?? 0,
    name,
    type: form.value.type,
    children: children.length > 0 ? children : undefined,
  }
  if (form.value.price != null && !Number.isNaN(Number(form.value.price))) {
    payload.price = Number(form.value.price)
  }
  if (form.value.src?.trim()) {
    payload.src = form.value.src.trim()
  }
  emit('save', payload)
  emit('update:modelValue', false)
}
</script>

<style lang="stylus" scoped>
.children-list {
  margin-bottom: 12px;
}

.children-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .children-name {
    flex: 1;
    min-width: 0;
  }

  .children-price {
    width: 120px;
  }
}
</style>
