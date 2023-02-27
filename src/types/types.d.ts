export type RoundQuestion = {
  roundMode: ROUND_MODE
} & Question

export type Answer = {
  text: string
  points: number
  isAnswered: boolean
}
export type Question = {
  text: string
  answers: Answer[]
}

export type Team = {
  name: string
  points: number
}

export type Game = {
  teamOne: Team
  teamTwo: Team
  totalRounds: number
  stikes: number
}
