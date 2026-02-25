<template>
  <div class="jizhang-view">
    <div class="left-side">
      <el-card shadow="hover" body-style="padding: 0;" class="left-side-card">
        <el-scrollbar>
          <GameItemPane :items="items" :columns="columns" />
        </el-scrollbar>
      </el-card>
    </div>
    <div class="right-side">
      <GameRecord></GameRecord>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameItemPane from './components/GameItem/GameItemPane.vue'
import GameRecord from './components/GameRecord.vue'
import { useConfigStore } from '@/stores/modules/config'
import { computed } from 'vue'
import type { Game } from '@/types/game'

const configStore = useConfigStore()
const items = computed(() => configStore.getConfig<Game.GameItem[]>('items') ?? [])
const columns = computed(() => configStore.getConfig<number>('jizhang.columns') ?? 6)
</script>

<style lang="stylus" scoped>
.jizhang-view
  width 100%
  height 100%
  display flex
  flex-direction row
  .left-side
    width 400px
    height 100%
    flex-shrink 0
    padding 16px 0 16px 16px
    .left-side-card
      height 100%
      overflow hidden
  .right-side
    flex 1
    height 100%
    overflow hidden
</style>
