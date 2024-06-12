import type { Answer, Question } from '@/types/types'
import { ABLY_CHANNEL, ROUND_MODE } from './constants'

export function getAnsweredPoints(answers?: Answer[], roundMode?: ROUND_MODE) {
  if (!answers || !Array.isArray(answers)) return 0
  const multiplier = getMultiplier(roundMode || ROUND_MODE.NORMAL)

  return answers.reduce((cur, next) => {
    if (next.isAnswered) return cur + next.points * multiplier

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

export function getGameChannel(channelCode: string) {
  return `${channelCode}_${ABLY_CHANNEL}`.toLowerCase()
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getDistribuatedPoints(totalQuestions: number): number[] {
  const nice = (s: number) => s.toString().replace(/\d\d$/, '.$&')
  const points = Array.from({ length: totalQuestions }, () => getRandomNumber(10, 95))

  const sum = points.reduce((a, b) => a + b)
  let offset = 1e4
  return points
    .map((v, j, { length }) => {
      if (j + 1 === length) return parseInt(nice(offset))
      const i = Math.round((v * 1e4) / sum)
      offset -= i
      return parseInt(nice(i))
    })
    .sort((a, b) => b - a)
}

export function validateQuestions(questions: Question[]): Question[] {
  return questions.map((q) => {
    const { answers } = q
    let newAnwers: Answer[]

    const sum = answers.reduce((cur, next) => cur + next.points, 0)

    if (sum <= 80) {
      const newPoints = getDistribuatedPoints(answers.length)

      newAnwers = answers.map((a, i) => ({ ...a, points: newPoints[i] }))
    } else {
      newAnwers = answers.map((a, i) => {
        const offset = answers.length - i

        return {
          ...a,
          points: a.points + offset,
        }
      })
    }

    return { ...q, answers: newAnwers }
  })
}
