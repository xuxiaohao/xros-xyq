<template>
  <span
    class="x-number"
    :class="{
      'x-number--positive': numberValue > 0,
      'x-number--negative': numberValue < 0,
      'x-number--zero': numberValue === 0,
      [`x-number--${size}`]: typeof size === 'string',
    }"
    :style="sizeStyle"
  >
    <span v-if="prefix" class="x-number__prefix">{{ prefix }}</span>
    <InlineEdit
      v-if="editable"
      v-model="internalValue"
      type="number"
      :precision="precision"
      :validator="validator"
      :show-icon="false"
      @update:model-value="handleValueChange"
      @change="handleChange"
    />
    <span v-else class="x-number__value">{{ formattedValue }}</span>
    <span v-if="suffix" class="x-number__suffix">{{ suffix }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useTransition } from '@vueuse/core'
import { Formula } from '@/utils/formula/Formula.class'
import InlineEdit from '@/components/InlineEdit/InlineEdit.vue'

/**
 * XNumber 组件 Props
 */
interface Props {
  /** 数值（当 formula 存在时，此值作为 formula.exec() 的参数） */
  value?: number
  /** Formula 实例，用于计算数值 */
  formula?: Formula
  /** Formula 执行参数（传递给 formula.exec()） */
  formulaArgs?: any[]
  /** 是否启用过渡效果 */
  transition?: boolean
  /** 过渡持续时间（毫秒） */
  transitionDuration?: number
  /** 是否可编辑 */
  editable?: boolean
  /** 前缀文本 */
  prefix?: string
  /** 后缀文本 */
  suffix?: string
  /** 数字精度 */
  precision?: number
  /** 自定义校验函数（仅当 editable 为 true 时有效） */
  validator?: (value: any) => boolean | string
  /** 尺寸大小，支持预设值 'small' | 'medium' | 'large' 或自定义数字（像素值） */
  size?: 'small' | 'medium' | 'large' | number
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  transition: false,
  transitionDuration: 500,
  editable: false,
  precision: undefined,
  size: 'medium',
})

const emit = defineEmits<{
  'update:value': [value: number]
  change: [value: number]
}>()

// 内部值（用于编辑模式）
// 注意：当 editable 为 true 时，应该使用原始的 value 或 formula 计算结果，而不是过渡后的值
const internalValue = computed({
  get: () => {
    // 可编辑模式下，使用原始计算值（不应用过渡）
    return props.editable ? computedValue.value : numberValue.value
  },
  set: (val: number | string) => {
    const numVal = typeof val === 'string' ? Number(val) : val
    emit('update:value', numVal)
  },
})

// 计算数值
const computedValue = computed(() => {
  if (props.formula) {
    // 使用 Formula 计算
    if (props.formulaArgs) {
      return props.formula.exec(...props.formulaArgs)
    }
    // 如果没有提供 formulaArgs，使用 value 作为参数
    return props.formula.exec(props.value)
  }
  // 直接使用 value
  return props.value ?? 0
})

// 应用过渡效果
const transitionValue = useTransition(
  computedValue,
  props.transition
    ? {
        duration: props.transitionDuration,
      }
    : {
        duration: 0,
      },
)

// 最终显示的数值
const numberValue = computed(() => {
  return props.transition ? transitionValue.value : computedValue.value
})

// 格式化后的数值（应用精度）
const formattedValue = computed(() => {
  const val = numberValue.value
  if (props.precision !== undefined) {
    return val.toFixed(props.precision)
  }
  return val.toString()
})

// 尺寸样式
const sizeStyle = computed(() => {
  if (typeof props.size === 'number') {
    // 自定义数字，直接设置字体大小和行高
    return {
      fontSize: `${props.size}px`,
      lineHeight: `${props.size * 1.5}px`,
    }
  }
  // 预设值通过 CSS 类处理，不需要内联样式
  return {}
})

/**
 * 处理值变化
 */
const handleValueChange = (val: number | string) => {
  const numVal = typeof val === 'string' ? Number(val) : val
  emit('update:value', numVal)
}

/**
 * 处理值改变事件
 */
const handleChange = (val: number | string) => {
  const numVal = typeof val === 'string' ? Number(val) : val
  emit('change', numVal)
}

// 监听外部 value 变化，同步到内部值（仅当可编辑时）
watch(
  () => props.value,
  (newValue) => {
    if (props.editable && newValue !== undefined) {
      // 值已通过 computed 自动同步
    }
  },
)
</script>

<style lang="stylus" scoped>
.x-number {
  display: inline-flex;
  align-items: baseline;
  color: #e0e0e0;
  font-size: inherit;
  line-height: inherit;
}

.x-number__prefix,
.x-number__suffix {
  color: inherit;
  margin: 0 2px;
}

.x-number__value {
  color: inherit;
  font-weight: inherit;
}

// 预设尺寸
.x-number--small {
  font-size: 12px;
  line-height: 18px;
}

.x-number--medium {
  font-size: 14px;
  line-height: 21px;
}

.x-number--large {
  font-size: 16px;
  line-height: 24px;
}

.x-number--positive {
  color: #67c23a;
}

.x-number--negative {
  color: #f56c6c;
}

.x-number--zero {
  color: #e0e0e0;
}
</style>
