<template>
  <div
    class="inline-edit"
    :class="{ 'inline-edit--editing': isEditing, 'inline-edit--disabled': disabled }"
  >
    <!-- 显示模式 - 始终存在以保持布局 -->
    <div
      class="inline-edit__display"
      :class="{
        'inline-edit__display--show-icon': showIcon,
        'inline-edit__display--editing': isEditing,
      }"
      @click="handleClick"
    >
      <span class="inline-edit__text">{{ displayValue }}</span>
      <el-icon v-if="!disabled" class="inline-edit__icon">
        <Edit />
      </el-icon>
    </div>
    <!-- 编辑模式 - 绝对定位覆盖 -->
    <div v-if="isEditing" class="inline-edit__input-wrapper">
      <el-input-number
        v-if="type === 'number'"
        ref="inputRef"
        v-model="editValue"
        :placeholder="placeholder"
        :min="0"
        :precision="precision"
        :controls="false"
        class="inline-edit__input"
        @blur="handleBlur"
        @keyup.enter="handleSave"
        @keyup.esc="handleCancel"
      />
      <el-input
        v-else
        ref="inputRef"
        v-model="editValue"
        :placeholder="placeholder"
        class="inline-edit__input"
        @blur="handleBlur"
        @keyup.enter="handleSave"
        @keyup.esc="handleCancel"
      />
      <span v-if="errorMessage" class="inline-edit__error">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { InputInstance, InputNumberInstance } from 'element-plus'

/**
 * 行内编辑组件 Props
 */
interface Props {
  /** 当前值 */
  modelValue: string | number
  /** 输入类型 */
  type?: 'text' | 'number'
  /** 自定义校验函数，返回 true 表示通过，返回字符串表示错误信息 */
  validator?: (value: any) => boolean | string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 数字精度（仅当 type 为 number 时有效） */
  precision?: number
  /** 是否显示编辑图标，启用时图标常驻显示 */
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'number',
  disabled: false,
  precision: undefined,
  showIcon: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

// 编辑状态
const isEditing = ref(false)
const editValue = ref<string | number>(props.modelValue)
const errorMessage = ref<string>('')
const inputRef = ref<InputInstance | InputNumberInstance>()

// 显示值
const displayValue = computed(() => {
  if (props.type === 'number') {
    return typeof props.modelValue === 'number' ? props.modelValue : Number(props.modelValue) || 0
  }
  return props.modelValue || ''
})

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (!isEditing.value) {
      editValue.value = newValue
    }
  },
)

/**
 * 校验值
 */
const validate = (value: any): boolean => {
  errorMessage.value = ''

  // 数字类型校验
  if (props.type === 'number') {
    const numValue = typeof value === 'string' ? Number(value) : value
    if (isNaN(numValue)) {
      errorMessage.value = '请输入有效的数字'
      return false
    }
    if (numValue < 0) {
      errorMessage.value = '数值不能为负数'
      return false
    }
  }

  // 自定义校验
  if (props.validator) {
    const result = props.validator(value)
    if (result === true) {
      return true
    } else if (typeof result === 'string') {
      errorMessage.value = result
      return false
    } else {
      return false
    }
  }

  return true
}

/**
 * 处理点击事件
 */
const handleClick = () => {
  if (props.disabled) return
  isEditing.value = true
  editValue.value = props.modelValue
  errorMessage.value = ''
  nextTick(() => {
    // 聚焦输入框
    if (inputRef.value) {
      const inputEl =
        (inputRef.value as any).$el?.querySelector('input') || (inputRef.value as any).$el
      if (inputEl) {
        inputEl.focus()
        inputEl.select()
      }
    }
  })
}

/**
 * 处理保存
 */
const handleSave = () => {
  if (validate(editValue.value)) {
    const finalValue = props.type === 'number' ? Number(editValue.value) : String(editValue.value)
    emit('update:modelValue', finalValue)
    emit('change', finalValue)
    isEditing.value = false
    errorMessage.value = ''
  } else {
    // 校验失败，保持编辑状态
    ElMessage.warning(errorMessage.value || '输入值无效')
  }
}

/**
 * 处理取消
 */
const handleCancel = () => {
  editValue.value = props.modelValue
  isEditing.value = false
  errorMessage.value = ''
}

/**
 * 处理失焦
 */
const handleBlur = () => {
  // 延迟执行，以便点击其他元素时能正常处理
  setTimeout(() => {
    if (validate(editValue.value)) {
      handleSave()
    } else {
      // 校验失败，恢复原值
      handleCancel()
    }
  }, 200)
}
</script>

<style lang="stylus" scoped>
.inline-edit {
  display: inline-flex;
  align-items: center;
  position: relative;
  min-width: 60px;
}

.inline-edit__display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-radius: 4px;
  padding: 0 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  &--editing {
    opacity: 0;
    pointer-events: none;
  }
}

.inline-edit__text {
  color: #e0e0e0;
  user-select: none;
}

.inline-edit__icon {
  font-size: 14px;
  color: #ffd700;
  opacity: 0;
  transition: opacity 0.2s;
}

.inline-edit__display:hover .inline-edit__icon {
  opacity: 1;
}

.inline-edit__display--show-icon .inline-edit__icon {
  opacity: 1;
}

.inline-edit__input-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
}

.inline-edit__input {
  width: 100%;

  :deep(.el-input__wrapper) {
    background-color: #1a1a1a;
    border-color: #404040;
    box-shadow: none;

    &:hover {
      border-color: #ffd700;
    }

    &.is-focus {
      border-color: #ffd700;
      box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.2);
    }
  }

  :deep(.el-input__inner) {
    color: #e0e0e0;
    background-color: transparent;
  }

  :deep(.el-input-number__decrease),
  :deep(.el-input-number__increase) {
    background-color: #2b2b2b;
    color: #e0e0e0;
    border-color: #404040;
  }
}

.inline-edit__error {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1;
  white-space: nowrap;
  z-index: 11;
}

.inline-edit--disabled {
  .inline-edit__display {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background-color: transparent;
    }
  }
}
</style>
