import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { Timer, TimerStatus } from '@/utils/Timer.class'

const useTimerStore = defineStore(
  'timer',
  () => {
    const timer = new Timer({
      interval: 1000,
      autoStart: false,
    })

    timer.on('tick', (elapsed) => {
      elapsedTime.value = elapsed
    })
    timer.on('start', () => {
      status.value = TimerStatus.RUNNING
    })
    timer.on('pause', () => {
      status.value = TimerStatus.PAUSED
    })
    timer.on('resume', () => {
      status.value = TimerStatus.RUNNING
    })
    timer.on('stop', () => {
      status.value = TimerStatus.STOPPED
    })
    const status = ref<TimerStatus>(TimerStatus.STOPPED)
    const elapsedTime = ref<{ hours: number; minutes: number; seconds: number }>({
      hours: 0,
      minutes: 0,
      seconds: 0,
    })

    // 等待缓存加载完成
    nextTick(() => {
      // 设置开始时间
      timer.setElapsed(elapsedTime.value, status.value)
      if (status.value === TimerStatus.RUNNING) {
        timer.pause()
        // timer.start(true)
      } else if (status.value === TimerStatus.PAUSED) {
        timer.pause()
      } else if (status.value === TimerStatus.STOPPED) {
        timer.stop()
      }
    })

    // 格式化已过去的时间
    const elapsedTimeString = computed(() => {
      return `${elapsedTime.value.hours.toString().padStart(2, '0')}时${elapsedTime.value.minutes.toString().padStart(2, '0')}分${elapsedTime.value.seconds.toString().padStart(2, '0')}秒`
    })

    const startTimer = () => {
      timer.start()
    }

    const pauseTimer = () => {
      timer.pause()
    }

    const resumeTimer = () => {
      timer.resume()
    }

    const stopTimer = () => {
      timer.stop()
      // 重置时间
      elapsedTime.value = {
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    }

    return {
      status,
      elapsedTime,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      elapsedTimeString,
    }
  },
  {
    persist: true,
  },
)

export { useTimerStore }
