import * as React from 'react'
import { getAnsweredPoints } from '@/utility/functions'
import { SystemStyleObject } from '@mui/system/styleFunctionSx'
import CloseIcon from '@mui/icons-material/Close'

import {
  Box,
  BoxProps,
  Grid,
  Typography,
  Theme,
  SxProps,
  Hidden,
  useTheme,
  useMediaQuery,
} from '@mui/material'

import type { Game, Question, Answer } from '@/types/types'

const BLUE_BOX_STYLE: SystemStyleObject<Theme> = {
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
const BLUE_BOX_STYLE_FLEX: SystemStyleObject<Theme> = {
  ...BLUE_BOX_STYLE,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

interface StrikeBoxProps {
  active?: boolean
}
function StrikeBox({ active }: StrikeBoxProps) {
  const color = active ? '#d32f2f' : '#424242'
  return (
    <CloseIcon
      sx={{
        color,
        border: `4px solid ${color}`,
        borderRadius: 2,
        fontSize: {
          xs: 64,
          sm: 58,
          md: 96,
          lg: 128,
        },
      }}
    />
  )
}

function BlankAnswerBox({ ...other }: BoxProps) {
  return (
    <Box
      {...other}
      sx={{
        ...BLUE_BOX_STYLE_FLEX,
        ...other.sx,
      }}
    />
  )
}

interface NumberAnswerBoxProps extends Omit<BoxProps, 'position'> {
  number: number
  outlined?: boolean
}
function NumberAnswerBox({ number, outlined, ...other }: NumberAnswerBoxProps) {
  if (outlined)
    return (
      <Box
        {...other}
        sx={{
          ...BLUE_BOX_STYLE_FLEX,
          ...other.sx,
        }}
      >
        <Box
          sx={{
            backgroundColor: '#003171',
            border: '4px solid #FFF',
            position: 'relative',
            borderRadius: 50,
            minWidth: {
              xs: 70,
              md: 105,
              lg: 120,
            },
            boxShadow: 'inset 0px 0px 15px 1px #000',
          }}
        >
          <Typography
            fontWeight='fontWeightBold'
            align='center'
            sx={{
              fontSize: {
                xs: '2.5rem',
                md: '4rem',
                lg: '4.5rem',
              },
              textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000',
            }}
          >
            {number}
          </Typography>
        </Box>
      </Box>
    )

  return (
    <Box
      {...other}
      sx={{
        ...BLUE_BOX_STYLE_FLEX,
        ...other.sx,
      }}
    >
      <Typography
        fontWeight='fontWeightBold'
        align='center'
        sx={{
          fontSize: {
            xs: 72,
            md: 104,
          },
          textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000',
        }}
      >
        {number}
      </Typography>
    </Box>
  )
}

interface TextAnswerBoxProps extends BoxProps {
  text: string
  points: number
}
function TextAnswerBox({ text, points, ...other }: TextAnswerBoxProps) {
  return (
    <Box
      {...other}
      sx={{
        ...BLUE_BOX_STYLE_FLEX,
        ...other.sx,
      }}
    >
      <Box display='flex' flexGrow={1} height='100%' width='100%' alignItems='center'>
        <Typography
          variant='h2'
          sx={{
            px: 1,
            fontWeight: 'fontWeightBold',
            flexGrow: 1,
            fontSize: {
              xs: 32,
              sm: 24,
              md: 40,
              lg: 48,
            },
            textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000',
          }}
        >
          {text.toUpperCase()}
        </Typography>
        <Box
          sx={{
            borderLeft: '4px groove #FFF',
            backgroundColor: '#376cbe',
            height: '100%',
            minWidth: {
              xs: 80,
              md: 100,
              lg: 125,
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            fontWeight='fontWeightBold'
            sx={{
              fontSize: {
                xs: 40,
                md: 64,
                lg: 80,
              },
              textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000',
            }}
          >
            {points}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

interface BoardBoxProps extends Partial<Answer>, BoxProps {
  blank?: boolean
  number: number
}
function BoardBox({ text, points, isAnswered, number, blank, ...other }: BoardBoxProps) {
  if (blank) return <BlankAnswerBox />

  if (isAnswered && text && points) return <TextAnswerBox text={text} points={points} />

  return <NumberAnswerBox number={number} outlined />
}

interface BoardProps {
  question?: Question
  game?: Game
  multiple?: number
}
export default function Board({ question, game, multiple = 1 }: BoardProps) {
  const theme = useTheme()
  const isTiny = useMediaQuery(theme.breakpoints.down('sm'))

  function getQuestions(start: number, end: number) {
    return Array(end - start + 1)
      .fill(undefined)
      .map((_, i) => {
        const index = i + start
        const a = question?.answers[index]
        const isBlank = !a

        if (isTiny && isBlank) return null

        return (
          <Grid item xs={12} key={index}>
            <BoardBox {...(a ? a : {})} blank={isBlank} number={index + 1} />
          </Grid>
        )
      })
  }
  const totalScore = question ? getAnsweredPoints(question) : 0

  return (
    <Box pt={2}>
      <Grid container>
        <Grid item xs={12}>
          <Grid container>
            <Hidden smDown>
              <Grid item xs={4} />
            </Hidden>
            <Grid
              item
              xs={12}
              sm={4}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <NumberAnswerBox
                number={totalScore}
                sx={{
                  height: {
                    xs: 100,
                    md: 150,
                  },
                  width: {
                    xs: 150,
                    md: 200,
                  },
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={4}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                justifyContent: {
                  xs: 'center',
                  sm: 'flex-end',
                },
              }}
            >
              <StrikeBox active={game ? game?.stikes >= 1 : false} />
              <StrikeBox active={game ? game?.stikes >= 2 : false} />
              <StrikeBox active={game ? game?.stikes >= 3 : false} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid container>{getQuestions(0, 3)}</Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid container>{getQuestions(4, 7)}</Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
