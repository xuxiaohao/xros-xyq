/**
 * Timer Web Worker
 * 用于精确计时，即使在页面后台也能正常工作
 */

/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope

interface TimerWorkerMessage {
  type: 'start' | 'pause' | 'resume' | 'stop' | 'reset' | 'setInterval'
  interval?: number
  startTime?: number
  elapsed?: number
}

let interval: number = 1000
let startTime: number = 0
let elapsed: number = 0
let isRunning: boolean = false
let timerId: number | null = null

/**
 * 计算并发送 tick 消息
 */
function tick() {
  if (isRunning) {
    elapsed = Date.now() - startTime
    // 向主线程发送 tick 消息
    self.postMessage({
      type: 'tick',
      elapsed,
    })
  }
}

/**
 * 启动定时器
 */
function startTimer(currentElapsed: number = 0) {
  if (isRunning || timerId !== null) {
    return
  }

  elapsed = currentElapsed
  startTime = Date.now() - elapsed
  isRunning = true

  // 立即发送一次 tick
  tick()

  // 使用 setInterval 在 Worker 中精确计时
  // Worker 中的定时器不受页面标签页状态影响
  timerId = self.setInterval(() => {
    tick()
  }, interval)
}

/**
 * 暂停定时器
 */
function pauseTimer() {
  if (!isRunning || timerId === null) {
    return
  }

  isRunning = false
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }

  // 更新已过去的时间
  elapsed = Date.now() - startTime

  self.postMessage({
    type: 'paused',
    elapsed,
  })
}

/**
 * 恢复定时器
 */
function resumeTimer() {
  if (isRunning || timerId !== null) {
    return
  }

  startTime = Date.now() - elapsed
  isRunning = true

  // 立即发送一次 tick
  tick()

  timerId = self.setInterval(() => {
    tick()
  }, interval)
}

/**
 * 停止定时器
 */
function stopTimer() {
  isRunning = false

  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }

  elapsed = Date.now() - startTime

  self.postMessage({
    type: 'stopped',
    elapsed,
  })

  // 重置
  elapsed = 0
  startTime = 0
}

/**
 * 重置定时器
 */
function resetTimer() {
  const wasRunning = isRunning
  stopTimer()

  elapsed = 0
  startTime = 0

  if (wasRunning) {
    startTimer(0)
  }
}

/**
 * 设置时间间隔
 */
function setTimerInterval(newInterval: number) {
  interval = newInterval

  // 如果正在运行，需要重启
  if (isRunning && timerId !== null) {
    const wasRunning = isRunning
    pauseTimer()
    if (wasRunning) {
      resumeTimer()
    }
  }
}

// 监听主线程发送的消息
self.addEventListener('message', (event: MessageEvent<TimerWorkerMessage>) => {
  const { type, interval: msgInterval, elapsed: msgElapsed } = event.data

  switch (type) {
    case 'start':
      startTimer(msgElapsed || 0)
      break
    case 'pause':
      pauseTimer()
      break
    case 'resume':
      resumeTimer()
      break
    case 'stop':
      stopTimer()
      break
    case 'reset':
      resetTimer()
      break
    case 'setInterval':
      if (msgInterval !== undefined) {
        setTimerInterval(msgInterval)
      }
      break
    default:
      break
  }
})
