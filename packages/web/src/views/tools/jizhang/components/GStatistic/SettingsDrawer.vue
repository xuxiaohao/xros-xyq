<template>
  <el-drawer
    :model-value="modelValue"
    title="设置"
    direction="rtl"
    size="360px"
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
      <div class="settings-drawer__footer">
        <el-button type="default" @click="configStore.resetConfig()">重置为默认</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/stores/modules/config'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const configStore = useConfigStore()
</script>

<style lang="stylus" scoped>
.settings-drawer__body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-drawer__footer {
  margin-top: auto;
  padding-top: 16px;
}
</style>
