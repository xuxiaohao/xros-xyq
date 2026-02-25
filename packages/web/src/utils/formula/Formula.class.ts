import type { Expression } from 'expr-eval'
import { Parser } from 'expr-eval'
import { round } from 'lodash-es'

const parser = new Parser({
  // 自定义函数
  operators: {
    // 直接把 Math 对象里的 floor 方法绑定进去
    floor: Math.floor,
    ceil: (a: number) => {
      console.log(a)
      return Math.ceil(a)
    },
  },
} as any)

interface FormulaOptions {
  /** 公式名称 */
  name: string
  /** 公式 */
  formula: string
  /** 公式描述 */
  description?: string
  /** 获取公式因子 */
  getFactors: (...args: any[]) => Record<string, any>
}

export class Formula {
  private options: FormulaOptions
  private formula: string
  private expr: Expression
  constructor(options: FormulaOptions) {
    this.options = options
    this.formula = options.formula
    this.expr = parser.parse(this.formula)
  }

  exec(...args: any[]) {
    const factors = this.options.getFactors(...(args as any[]))
    return Math.floor(this.expr.evaluate(factors))
  }
}
