export type ListQuestion = {
  showAnswers?: boolean
  selected?: boolean
  active?: boolean
} & RoundQuestion

export type RoundQuestion = {
  roundMode: ROUND_MODE
} & Question

export type Answer = {
  text: string
  points: number
  isAnswered: boolean
  showAnswer: boolean
}
export type Question = {
  text: string
  answers: Answer[]
  tags?: string[]
}

export type TeamName = 'teamOne' | 'teamTwo'

export type Team = {
  name: string
  points: number
}

export type Game = {
  teamOne: Team
  teamTwo: Team
  totalRounds: number
  roundsPlayed: number
  strikes: number
}

export type Volume = {
  theme: number
  ding: number
  buzzer: number
}

export interface QuestionResponse {
  questions: Question[]
  page: number
  totalPages: number
}
