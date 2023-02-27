export enum ABLY_EVENTS {
  GAME_CHANGE = 'gameChange',
  QUESTION_CHANGE = 'questionChange',
}

export const ABLY_CHANNEL = 'status-updates'
export const STORAGE_KEY = 'PostFamilyFeud'
export const HOST_STORAGE_KEY = 'PostFamilyFeudHost'
export const JUDGE_STORAGE_KEY = 'PostFamilyFeudJudge'

export enum ROUND_MODE {
  NONE = 'none',
  NORMAL = 'normal',
  DOUBLE = 'double',
  TRIPLE = 'triple',
  FAST_MONEY = 'fastmoney',
}
