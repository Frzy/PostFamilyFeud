import type { Question } from '@/types/types'

export function getAnsweredPoints(q: Question, multiple = 1) {
  if (!q || !Array.isArray(q.answers)) return 0

  return q.answers.reduce((cur, next) => {
    if (next.isAnswered) return cur + next.points * multiple

    return cur
  }, 0)
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  abortValue: any = undefined,
) {
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
