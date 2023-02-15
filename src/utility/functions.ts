import type { Question } from '@/types/types'

export function getAnsweredPoints(q: Question, multiple = 1) {
  if (!q || !Array.isArray(q.answers)) return 0

  return q.answers.reduce((cur, next) => {
    if (next.isAnswered) return cur + next.points * multiple

    return cur
  }, 0)
}
