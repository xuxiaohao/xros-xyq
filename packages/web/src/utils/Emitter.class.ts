/**
 * 事件监听器类型
 */
type EventListener = (...args: any[]) => void

/**
 * 事件监听器配置
 */
interface ListenerConfig {
  /** 监听器函数 */
  listener: EventListener
  /** 是否只执行一次 */
  once: boolean
}

/**
 * 事件发布订阅类
 * 提供事件监听、触发、移除等功能
 *
 * @example
 * ```ts
 * const emitter = new Emitter()
 *
 * // 监听事件
 * emitter.on('event', (data) => {
 *   console.log('收到事件:', data)
 * })
 *
 * // 触发事件
 * emitter.emit('event', 'Hello')
 *
 * // 只监听一次
 * emitter.once('event', (data) => {
 *   console.log('只执行一次:', data)
 * })
 *
 * // 移除监听器
 * emitter.off('event', listener)
 *
 * // 移除所有监听器
 * emitter.removeAllListeners('event')
 * ```
 */
export class Emitter {
  /**
   * 存储所有事件监听器
   * key: 事件名称
   * value: 监听器数组
   */
  private events: Map<string, ListenerConfig[]> = new Map()

  /**
   * 订阅事件
   * @param event 事件名称
   * @param listener 监听器函数
   * @returns 返回当前实例，支持链式调用
   */
  on(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push({
      listener,
      once: false,
    })
    return this
  }

  /**
   * 订阅事件（只执行一次）
   * @param event 事件名称
   * @param listener 监听器函数
   * @returns 返回当前实例，支持链式调用
   */
  once(event: string, listener: EventListener): this {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push({
      listener,
      once: true,
    })
    return this
  }

  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param listener 要移除的监听器函数，如果不提供则移除该事件的所有监听器
   * @returns 返回当前实例，支持链式调用
   */
  off(event: string, listener?: EventListener): this {
    if (!this.events.has(event)) {
      return this
    }

    if (!listener) {
      // 如果没有指定监听器，移除该事件的所有监听器
      this.events.delete(event)
      return this
    }

    // 移除指定的监听器
    const listeners = this.events.get(event)!
    const index = listeners.findIndex((config) => config.listener === listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }

    // 如果该事件没有监听器了，删除该事件
    if (listeners.length === 0) {
      this.events.delete(event)
    }

    return this
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 传递给监听器的参数
   * @returns 返回当前实例，支持链式调用
   */
  emit(event: string, ...args: any[]): this {
    if (!this.events.has(event)) {
      return this
    }

    const listeners = this.events.get(event)!
    // 创建一个副本，避免在执行过程中修改原数组导致的问题
    const listenersToCall = [...listeners]

    listenersToCall.forEach((config) => {
      // 执行监听器
      config.listener(...args)

      // 如果是只执行一次的监听器，执行后立即移除
      if (config.once) {
        this.off(event, config.listener)
      }
    })

    return this
  }

  /**
   * 移除指定事件的所有监听器
   * @param event 事件名称，如果不提供则移除所有事件的所有监听器
   * @returns 返回当前实例，支持链式调用
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
    return this
  }

  /**
   * 获取指定事件的监听器数量
   * @param event 事件名称
   * @returns 监听器数量
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.length || 0
  }

  /**
   * 获取所有已注册的事件名称列表
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }

  /**
   * 检查指定事件是否已有监听器
   * @param event 事件名称
   * @returns 是否有监听器
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0
  }
}
