import { SystemStyleObject } from '@mui/system/styleFunctionSx'
import { Theme } from '@mui/material'
import { Game } from '@/types/types'

export enum ABLY_EVENTS {
  GAME_CHANGE = 'gameChange',
  QUESTION_CHANGE = 'questionChange',
  WRONG_ANSWER = 'wrongAnswer',
  CORRECT_ANSWER = 'correctAnswer',
  NEW_ROUND = 'newRound',
  SHOW_QUESTION = 'showQuestion',
  PLAY_THEME = 'playTheme',
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

export const BLUE_BOX_STYLE: SystemStyleObject<Theme> = {
  backgroundColor: '#0c53b0',
  overflow: 'hidden',
  border: '4px groove #FFF',
  position: 'relative',
  borderRadius: 2,
  margin: 0.5,
  boxShadow: 'inset 0px 0px 15px 1px #000',
  height: {
    xs: 100,
    md: 150,
  },
  '&:before': {
    backgroundColor: 'initial',
    backgroundImage: 'linear-gradient(#fff 0, rgba(255, 255, 255, 0) 100%)',

    content: '""',
    height: '50%',
    opacity: '.5',
    position: 'absolute',
    top: '0',
    transition: 'all .3s',
    width: '100%',
  },
}

export const BLUE_BOX_STYLE_FLEX: SystemStyleObject<Theme> = {
  ...BLUE_BOX_STYLE,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

export const BASE_GAME: Game = {
  teamOne: {
    name: '',
    points: 0,
  },
  teamTwo: {
    name: '',
    points: 0,
  },
  totalRounds: 5,
  roundsPlayed: 0,
  strikes: 0,
}
