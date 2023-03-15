import * as React from 'react'

import { Grid, GridProps, Typography, useMediaQuery, useTheme, Hidden } from '@mui/material'
import PointTotal from './pointTotal'
import BoardTile from './boardTile'
import Strike from './strike'

import type { Game, RoundQuestion } from '@/types/types'
import { getAnsweredPoints, getMultiplier } from '@/utility/functions'

interface BoardProps extends GridProps {
  question?: RoundQuestion
  game?: Game
  showQuestion?: boolean
}
export default function Board2({ game, question, showQuestion, ...other }: BoardProps) {
  const theme = useTheme()
  const isTiny = useMediaQuery(theme.breakpoints.down('sm'))
  const multiple = getMultiplier(question?.roundMode)

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
            <BoardTile
              answer={a?.text}
              points={a?.points}
              isBlank={isBlank}
              position={index + 1}
              showAnswer={a?.showAnswer}
            />
          </Grid>
        )
      })
  }

  return (
    <Grid container {...other}>
      {question && showQuestion ? (
        <Grid item xs={12}>
          <Typography
            variant='h2'
            align='center'
            sx={{
              minHeight: { xs: undefined, md: 158 },
            }}
          >
            {question.text}
          </Typography>
        </Grid>
      ) : (
        <React.Fragment>
          <Hidden mdDown>
            <Grid
              item
              xs={4}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {multiple > 1 && (
                <Typography
                  variant='h3'
                  fontWeight='fontWeightBold'
                  sx={{
                    color: 'white',
                    textShadow:
                      '0 0 20px #fff, 0 0 30px #F5BD02, 0 0 40px #F5BD02, 0 0 50px #F5BD02, 0 0 60px #F5BD02, 0 0 70px #F5BD02, 0 0 80px #F5BD02',
                  }}
                >
                  {multiple === 2 ? 'Double Points' : multiple === 3 ? 'Triple Points' : ''}
                </Typography>
              )}
            </Grid>
            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <PointTotal total={getAnsweredPoints(question?.answers, question?.roundMode)} />
            </Grid>
            <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Strike active={game ? game?.strikes >= 1 : false} />
              <Strike active={game ? game?.strikes >= 2 : false} />
              <Strike active={game ? game?.strikes >= 3 : false} />
            </Grid>
          </Hidden>
          <Hidden mdUp>
            <Grid item xs={3}></Grid>
            <Grid
              item
              xs={6}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <PointTotal total={getAnsweredPoints(question?.answers, question?.roundMode)} />
            </Grid>
            <Grid
              item
              xs={3}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {multiple > 1 && (
                <Typography
                  variant='h3'
                  fontWeight='fontWeightBold'
                  sx={{
                    color: 'white',
                    textShadow:
                      '0 0 10px #fff, 0 0 15px #F5BD02, 0 0 20px #F5BD02, 0 0 30px #F5BD02',
                  }}
                >
                  {`x${multiple}`}
                </Typography>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}
            >
              <Strike active={true} />
              <Strike active={game ? game?.strikes >= 2 : false} />
              <Strike active={game ? game?.strikes >= 3 : false} />
            </Grid>
          </Hidden>
        </React.Fragment>
      )}

      <Grid item xs={12} sm={6}>
        <Grid container>{getQuestions(0, 3)}</Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Grid container>{getQuestions(4, 7)}</Grid>
      </Grid>
    </Grid>
  )
}
