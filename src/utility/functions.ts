import type { RoundQuestion } from '@/types/types'
import { ROUND_MODE } from './constants'

export function getAnsweredPoints(q?: RoundQuestion) {
  if (!q || !Array.isArray(q.answers)) return 0
  const multiple = getMultiplier(q.roundMode)

  return q.answers.reduce((cur, next) => {
    if (next.isAnswered) return cur + next.points * multiple

    return cur
  }, 0)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abortValue: any = undefined,
) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let cancel = () => {}
  // type Awaited<T> = T extends PromiseLike<infer U> ? U : T
  type ReturnT = Awaited<ReturnType<T>>
  const wrapFunc = (...args: Parameters<T>): Promise<ReturnT> => {
    cancel()
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(fn(...args)), wait)
      cancel = () => {
        clearTimeout(timer)
        if (abortValue !== undefined) {
          reject(abortValue)
        }
      }
    })
  }
  return wrapFunc
}

export function getMultiplier(roundMode: ROUND_MODE) {
  switch (roundMode) {
    case ROUND_MODE.DOUBLE:
      return 2
    case ROUND_MODE.TRIPLE:
      return 3
    default:
      return 1
  }
}
