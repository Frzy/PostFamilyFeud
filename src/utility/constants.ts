import { SystemStyleObject } from '@mui/system/styleFunctionSx'
import { Theme } from '@mui/material'
import { Game } from '@/types/types'

export enum ABLY_EVENTS {
  CORRECT_ANSWER = 'correctAnswer',
  NEW_GAME = 'newGame',
  GAME_CHANGE = 'gameChange',
  GAME_OVER = 'gameOver',
  NEW_ROUND = 'newRound',
  PLAY_MUSIC = 'playMusic',
  PUBLISH_QUESITON = 'publishQuestion',
  QUESTION_CHANGE = 'questionChange',
  SHOW_QUESTION = 'showQuestion',
  STOP_MUSIC = 'stopMusic',
  WRONG_ANSWER = 'wrongAnswer',
}

export enum MUSIC {
  THEME = 'theme',
  GUNSMOKE_OPEN = 'gunsmokeOpen',
  GUNSMOKE_END = 'gunsmokeEnd',
  GUNSMOKE_NEXT = 'gunsmokeNext',
}

export const ABLY_CHANNEL = 'status-updates'
export const STORAGE_KEY = 'PostFamilyFeud'
export const HOST_STORAGE_KEY = 'PostFamilyFeudHost'
export const JUDGE_STORAGE_KEY = 'PostFamilyFeudJudge'
export const QUESTION_STORAGE_KEY = 'PostFamilyFeudJudge'

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

export enum MUSIC_SRC {
  DING = '/sounds/family_feud_ding_V2.mp3',
  BUZZER = '/sounds/family_feud_buzzer_V2.mp3',
  FEUD_THEME = '/sounds/family_feud_theme_V2.mp3',
  GUNSMOKE_END = '/sounds/gunsmoke_ending_theme_V2.mp3',
  GUNSMOKE_THEME = '/sounds/gunsmoke_stay_tuned_V2.mp3',
  GUNSMOKE_STAY_TUNED = '/sounds/gunsmoke_opening_theme_V2.mp3',
}

export const SHOW_QUESTION_STRIKE_DELAY = 5000
