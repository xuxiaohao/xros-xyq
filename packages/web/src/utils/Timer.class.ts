import { Emitter } from './Emitter.class'

/**
 * 计时器状态枚举
 */
export enum TimerStatus {
  /** 未开始 */
  IDLE = 'idle',
  /** 运行中 */
  RUNNING = 'running',
  /** 已暂停 */
  PAUSED = 'paused',
  /** 已停止 */
  STOPPED = 'stopped',
}

/**
 * 计时器配置选项
 */
export interface TimerOptions {
  /** 时间间隔（毫秒），默认为 1000ms（1秒） */
  interval?: number
  /** 是否自动开始，默认为 false */
  autoStart?: boolean
  /** 初始时间（毫秒），默认为 0 */
  initialTime?: number
}

/**
 * 计时器类
 * 继承自 Emitter，支持事件发布订阅
 * 提供开始、暂停、恢复、停止等功能
 *
 * @example
 * ```ts
 * const timer = new Timer({ interval: 1000 })
 *
 * // 监听 tick 事件
 * timer.on('tick', (elapsed) => {
 *   console.log('已过去时间:', elapsed, 'ms')
 * })
 *
 * // 开始计时
 * timer.start()
 *
 * // 暂停
 * timer.pause()
 *
 * // 恢复
 * timer.resume()
 *
 * // 停止
 * timer.stop()
 * ```
 */
export class Timer extends Emitter {
  /** 当前状态 */
  private status: TimerStatus = TimerStatus.IDLE

  /** 时间间隔（毫秒） */
  private interval: number

  /** 已过去的时间（毫秒） */
  private elapsed: number = 0

  /** 已过去的时间（时/分/秒） */
  get elapsedTime(): { hours: number; minutes: number; seconds: number } {
    const hours = Math.floor(this.elapsed / 3600000)
    const minutes = Math.floor((this.elapsed % 3600000) / 60000)
    const seconds = Math.floor((this.elapsed % 60000) / 1000)
    return { hours, minutes, seconds }
  }

  /** 开始时间戳 */
  private startTime: number = 0

  /** 暂停时累计的时间 */
  private pausedElapsed: number = 0

  /** Web Worker 实例 */
  private worker: Worker | null = null

  /** 降级模式的定时器 ID（当 Worker 不可用时使用） */
  private fallbackTimerId: number | null = null

  /**
   * 创建计时器实例
   * @param options 配置选项
   */
  constructor(options: TimerOptions = {}) {
    super()
    this.interval = options.interval || 1000
    this.elapsed = options.initialTime || 0
    this.pausedElapsed = this.elapsed

    // 初始化 Web Worker
    this.initWorker()

    if (options.autoStart) {
      this.start()
    }
  }

  setElapsed(
    elapsedTime: { hours: number; minutes: number; seconds: number },
    status: TimerStatus,
  ): void {
    this.elapsed =
      elapsedTime.hours * 3600000 + elapsedTime.minutes * 60000 + elapsedTime.seconds * 1000
    this.pausedElapsed = this.elapsed
    this.status = status
  }

  /**
   * 初始化 Web Worker
   */
  private initWorker(): void {
    try {
      // 在 Vite 中使用 new URL 和 import.meta.url 来创建 Worker
      // 使用 ?worker 后缀让 Vite 正确处理 Worker
      this.worker = new Worker(new URL('./timer.worker.ts?worker', import.meta.url), {
        type: 'module',
      })

      // 监听 Worker 消息
      this.worker.onmessage = (event: MessageEvent) => {
        const { type, elapsed } = event.data

        switch (type) {
          case 'tick':
            if (elapsed !== undefined) {
              this.elapsed = elapsed
              this.emit('tick', this.elapsedTime)
            }
            break
          case 'paused':
            if (elapsed !== undefined) {
              this.elapsed = elapsed
              this.pausedElapsed = elapsed
            }
            break
          case 'stopped':
            if (elapsed !== undefined) {
              this.elapsed = elapsed
            }
            break
          default:
            break
        }
      }

      // 监听 Worker 错误
      this.worker.onerror = (error) => {
        console.error('Timer Worker error:', error)
        // Worker 失败时降级到 setInterval
        this.fallbackToInterval()
      }

      // 设置初始间隔
      this.worker.postMessage({
        type: 'setInterval',
        interval: this.interval,
      })
    } catch (error) {
      console.warn('Failed to create Timer Worker, falling back to setInterval:', error)
      // 如果 Worker 不支持，降级到 setInterval
      this.fallbackToInterval()
    }
  }

  /**
   * 降级到 setInterval（当 Worker 不可用时）
   */
  private fallbackToInterval(): void {
    this.worker = null
    // 使用原有的 setInterval 逻辑
  }

  /**
   * 开始计时
   * @returns 返回当前实例，支持链式调用
   */
  start(isResume: boolean = false): this {
    if (this.status === TimerStatus.RUNNING) {
      return this
    }

    // 如果是从暂停状态恢复，使用之前累计的时间
    if (this.status === TimerStatus.PAUSED) {
      this.elapsed = this.pausedElapsed
    } else if (isResume) {
      this.elapsed = this.elapsed
    } else {
      // 如果是重新开始，重置时间
      this.elapsed = 0
      this.pausedElapsed = 0
    }

    this.status = TimerStatus.RUNNING
    this.startTime = Date.now() - this.elapsed

    if (this.worker) {
      // 使用 Web Worker 精确计时
      this.worker.postMessage({
        type: 'start',
        elapsed: this.elapsed,
        interval: this.interval,
      })
    } else {
      // 降级到 setInterval
      if (this.fallbackTimerId !== null) {
        clearInterval(this.fallbackTimerId)
      }
      this.fallbackTimerId = window.setInterval(() => {
        this.update()
      }, this.interval)
      // 立即触发一次 tick
      this.update()
    }

    // 发出 start 事件
    this.emit('start', this.elapsedTime)

    return this
  }

  /**
   * 暂停计时
   * @returns 返回当前实例，支持链式调用
   */
  pause(): this {
    if (this.status !== TimerStatus.RUNNING) {
      return this
    }

    // 更新已过去的时间
    if (!this.worker) {
      this.update()
    }
    this.pausedElapsed = this.elapsed

    if (this.worker) {
      // 使用 Web Worker
      this.worker.postMessage({
        type: 'pause',
      })
    } else {
      // 降级模式：清除定时器
      if (this.fallbackTimerId !== null) {
        clearInterval(this.fallbackTimerId)
        this.fallbackTimerId = null
      }
    }

    this.status = TimerStatus.PAUSED

    // 发出 pause 事件
    this.emit('pause', this.elapsedTime)

    return this
  }

  /**
   * 恢复计时（从暂停状态继续）
   * @returns 返回当前实例，支持链式调用
   */
  resume(): this {
    if (this.status !== TimerStatus.PAUSED) {
      return this
    }

    this.status = TimerStatus.RUNNING
    this.startTime = Date.now() - this.pausedElapsed
    this.elapsed = this.pausedElapsed

    if (this.worker) {
      // 使用 Web Worker
      this.worker.postMessage({
        type: 'resume',
      })
    } else {
      // 降级模式：启动定时器
      if (this.fallbackTimerId !== null) {
        clearInterval(this.fallbackTimerId)
      }
      this.fallbackTimerId = window.setInterval(() => {
        this.update()
      }, this.interval)
      // 立即触发一次 tick
      this.update()
    }

    // 发出 resume 事件
    this.emit('resume', this.elapsedTime)

    return this
  }

  /**
   * 停止计时并重置
   * @returns 返回当前实例，支持链式调用
   */
  stop(): this {
    if (this.status === TimerStatus.STOPPED || this.status === TimerStatus.IDLE) {
      return this
    }

    // 更新已过去的时间
    if (!this.worker) {
      this.update()
    }

    if (this.worker) {
      // 使用 Web Worker
      this.worker.postMessage({
        type: 'stop',
      })
    } else {
      // 降级模式：清除定时器
      if (this.fallbackTimerId !== null) {
        clearInterval(this.fallbackTimerId)
        this.fallbackTimerId = null
      }
    }

    // 重置状态
    this.status = TimerStatus.STOPPED
    this.elapsed = 0
    this.pausedElapsed = 0
    this.startTime = 0

    // 发出 stop 事件
    this.emit('stop', this.elapsedTime)

    return this
  }

  /**
   * 重置计时器（停止并清除时间）
   * @returns 返回当前实例，支持链式调用
   */
  reset(): this {
    const wasRunning = this.status === TimerStatus.RUNNING

    this.stop()

    this.status = TimerStatus.IDLE
    this.elapsed = 0
    this.pausedElapsed = 0

    if (wasRunning) {
      // 如果之前是运行状态，重新开始
      this.start()
    }

    return this
  }

  /**
   * 更新时间并触发 tick 事件
   */
  private update(): void {
    if (this.status === TimerStatus.RUNNING) {
      this.elapsed = Date.now() - this.startTime
      // 发出 tick 事件，传递已过去的时间
      this.emit('tick', this.elapsedTime)
    }
  }

  /**
   * 获取当前已过去的时间（毫秒）
   * @returns 已过去的时间
   */
  getElapsed(): number {
    if (this.status === TimerStatus.RUNNING) {
      // 运行中时，实时计算
      return Date.now() - this.startTime
    }
    // 暂停或停止时，返回保存的时间
    return this.elapsed
  }

  /**
   * 获取当前状态
   * @returns 当前状态
   */
  getStatus(): TimerStatus {
    return this.status
  }

  /**
   * 检查是否正在运行
   * @returns 是否正在运行
   */
  isRunning(): boolean {
    return this.status === TimerStatus.RUNNING
  }

  /**
   * 检查是否已暂停
   * @returns 是否已暂停
   */
  isPaused(): boolean {
    return this.status === TimerStatus.PAUSED
  }

  /**
   * 检查是否已停止
   * @returns 是否已停止
   */
  isStopped(): boolean {
    return this.status === TimerStatus.STOPPED || this.status === TimerStatus.IDLE
  }

  /**
   * 设置时间间隔
   * @param interval 新的时间间隔（毫秒）
   * @returns 返回当前实例，支持链式调用
   */
  setInterval(interval: number): this {
    this.interval = interval

    if (this.worker) {
      // 使用 Web Worker
      this.worker.postMessage({
        type: 'setInterval',
        interval: this.interval,
      })
    }

    // 如果正在运行，需要重启定时器以应用新的间隔
    if (this.status === TimerStatus.RUNNING) {
      const wasRunning = true
      this.pause()
      if (wasRunning) {
        this.resume()
      }
    }

    return this
  }

  /**
   * 获取时间间隔
   * @returns 时间间隔（毫秒）
   */
  getInterval(): number {
    return this.interval
  }

  /**
   * 销毁计时器，清理所有资源
   */
  destroy(): void {
    this.stop()

    // 终止 Web Worker
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    // 清理降级模式的定时器
    if (this.fallbackTimerId !== null) {
      clearInterval(this.fallbackTimerId)
      this.fallbackTimerId = null
    }

    this.removeAllListeners()
  }
}
