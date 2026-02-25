<template>
  <div class="g-statistic-container">
    <el-space class="g-statistic" wrap
      ><el-card style="width: 100%">
        <el-statistic title="在线时长" :value="elapsedTime" />
        <div class="mt-[24px]">
          <el-button type="primary" @click="clickTimerButton">{{
            timerStore.status === TimerStatus.RUNNING
              ? '暂停搬砖'
              : timerStore.status === TimerStatus.PAUSED
                ? '继续搬砖'
                : '开始搬砖'
          }}</el-button>
          <el-button type="primary" @click="clickFinishButton">结束搬砖</el-button>
          <el-button :icon="Setting" circle @click="drawerVisible = true" />
        </div>
      </el-card>
      <SettingsDrawer v-model="drawerVisible" />
      <el-card>
        <el-statistic title="物品总价值" :precision="1" group-separator="" :value="totalPrice" />
        <el-statistic class="inline-edit-statistic" title="现金" :precision="1" group-separator="">
          <template #suffix>
            <InlineEdit v-model="dataStore.money" />
          </template>
        </el-statistic>
      </el-card>
      <el-card>
        <el-statistic title="消耗点卡" :precision="0" group-separator="" :value="dkxh" />
        <el-statistic title="游戏币" :precision="1" group-separator="" :value="dkyxbxh" />
      </el-card>
      <el-card>
        <el-statistic
          title="总收益"
          :precision="1"
          group-separator=""
          :value="dataStore.totalIncome"
        >
          <template #suffix>
            <XNumber size="small" :value="dataStore.totalIncomeRmb" prefix="/" suffix="¥" />
          </template>
        </el-statistic>
        <el-statistic title="净收益" :precision="1" group-separator="" :value="dataStore.netIncome">
          <template #suffix>
            <XNumber size="small" :value="dataStore.netIncomeRmb" prefix="/" suffix="¥" />
          </template>
        </el-statistic>
      </el-card>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { useTimerStore } from '@/stores/modules/global/timer'
import { useJizhangRecordStore } from '@/stores/modules/jizhang/record'
import { useTransition } from '@vueuse/core'
import { TimerStatus } from '@/utils/Timer.class'
import { useDataStore } from '@/stores/modules/data'
import InlineEdit from '@/components/InlineEdit/InlineEdit.vue'
import XNumber from '@/components/XNumber/XNumber.vue'
import SettingsDrawer from './SettingsDrawer.vue'

const drawerVisible = ref(false)
const timerStore = useTimerStore()
const recordStore = useJizhangRecordStore()
const dataStore = useDataStore()

const elapsedTime = computed(() => {
  return timerStore.elapsedTimeString as unknown as number
})

const totalPrice = useTransition(
  computed(() => recordStore.totalPrice),
  {
    duration: 500,
  },
)

const dkxh = useTransition(
  computed(() => dataStore.dkxh),
  {
    duration: 500,
  },
)

const dkyxbxh = useTransition(
  computed(() => dataStore.dkyxbxh),
  {
    duration: 500,
  },
)
const clickTimerButton = () => {
  if (timerStore.status === TimerStatus.RUNNING) {
    timerStore.pauseTimer()
  } else {
    timerStore.startTimer()
  }
}

const clickFinishButton = () => {
  timerStore.stopTimer()
  recordStore.clearRecords()
  recordStore.setHighlightedRecordId(null)
  dataStore.money = 0
}
</script>

<style lang="stylus" scoped>
.g-statistic-container {
  width: 100%;
}

.g-statistic {
  width: 100%;
}

:deep(.el-card) {
  min-width: 180px;
}

.inline-edit-statistic {

  :deep(.el-statistic__number) {
    display: none;
  }
  :deep(.el-statistic__suffix) {
    margin-left: -6px;
  }
}
</style>
