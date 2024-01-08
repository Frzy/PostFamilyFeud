import * as React from 'react'
import * as Ably from 'ably'
import Head from 'next/head'
import store from 'store2'
import { configureAbly } from '@ably-labs/react-hooks'
import { ABLY_EVENTS, GAME_CHANNEL_KEY, JUDGE_STORAGE_KEY, ROUND_MODE } from '@/utility/constants'
import { getAnsweredPoints, getGameChannel } from '@/utility/functions'

import { Alert, Box, Button, Fab, Stack, useMediaQuery, useTheme } from '@mui/material'
import Answers from '@/components/judge/answers'
import Container from '@mui/material/Container'
import CreateGame from '@/components/judge/createGame'
import Divider from '@mui/material/Divider'
import GameRounds, { getRoundText } from '@/components/judge/gameRounds'
import Grid from '@mui/material/Unstable_Grid2'
import Paper from '@mui/material/Paper'
import Question from '@/components/judge/question'
import Strikes from '@/components/judge/strikes'
import Typography from '@mui/material/Typography'
import BroadcastsIcon from '@mui/icons-material/Podcasts'
import UpdateGameChannelDialog from '@/components/UpdateGameChannelDialog'
import type { Answer, Game, RoundQuestion, TeamName } from '@/types/types'
import GameChannelDialog from '@/components/GameChannelDialog'

const judgeCache = store.namespace(JUDGE_STORAGE_KEY)

export default function Judge() {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [gameChannel, setGameChannel] = React.useState<string | null>(
    store.get(GAME_CHANNEL_KEY, null),
  )
  const [showEditChannelDialog, setShowChannelEditDialog] = React.useState(false)
  const [channel, setChannel] = React.useState<Ably.Types.RealtimeChannelPromise | null>()
  const [hasCachedGame, setHasCachedGame] = React.useState(false)
  const [game, setGame] = React.useState<Game>()
  const [roundWinner, setRoundWinner] = React.useState<TeamName>()
  const [question, setQuestion] = React.useState<RoundQuestion>()
  const [revealQuestion, setRevealQuestion] = React.useState(false)
  const hasWinner = React.useMemo(() => {
    return !!roundWinner
  }, [roundWinner])
  const handleQuestionSubscription = React.useCallback((message: Ably.Types.Message) => {
    const newQuestion: RoundQuestion = message.data

    setQuestion(newQuestion)
  }, [])
  function getLayout() {
    // No Game Present
    if (!game) {
      return <CreateGame onCreate={handleCreateNewGame} />
    }

    if (!question) {
      return isSmall ? (
        <Stack spacing={1}>
          <Alert severity='info'>
            Round will start soon. Waiting for a question to be published.
          </Alert>
          <Strikes strikes={game.strikes} disabled />
          <GameRounds game={game} roundMode={ROUND_MODE.NONE} disabled />
        </Stack>
      ) : (
        <Grid container spacing={1}>
          <Grid xs={6}>
            <Stack spacing={1}>
              <Alert severity='info'>
                Round will start soon. Waiting for a question to be published.
              </Alert>
            </Stack>
          </Grid>
          <Grid xs={6}>
            <Stack spacing={1}>
              <Strikes strikes={game.strikes} disabled />
              <GameRounds game={game} roundMode={ROUND_MODE.NONE} disabled />
            </Stack>
          </Grid>
        </Grid>
      )
    }

    // Have game and question
    return isSmall ? (
      <Stack spacing={1}>
        <Paper sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Typography>{getRoundText(question.roundMode)}</Typography>
          <Typography>
            {game.roundsPlayed + 1} of {game.totalRounds}
          </Typography>
        </Paper>
        <Question question={question.text} onVisibilityChange={handleQuestionVisibilityChange} />
        <Strikes strikes={game.strikes} onChange={handleStrikeChange} />
        <Answers
          answers={question.answers}
          roundMode={question.roundMode}
          reveal={revealQuestion || game.strikes === 4 || hasWinner}
          onRevealChange={handleRevealChange}
          onChange={handleAnswerChange}
        />
        <GameRounds
          game={game}
          roundMode={question.roundMode}
          winner={roundWinner}
          onWinner={handleOnWinner}
          onUndoWinner={handleOnUndoWinner}
          onRoundChange={handleOnRoundChange}
        />
      </Stack>
    ) : (
      <Grid container spacing={1}>
        <Grid xs={6}>
          <Stack spacing={1}>
            <Question
              question={question.text}
              onVisibilityChange={handleQuestionVisibilityChange}
            />
            <Answers
              answers={question.answers}
              roundMode={question.roundMode}
              reveal={revealQuestion || game.strikes === 4 || hasWinner}
              onRevealChange={handleRevealChange}
              onChange={handleAnswerChange}
            />
          </Stack>
        </Grid>
        <Grid xs={6}>
          <Stack spacing={1}>
            <Strikes strikes={game.strikes} onChange={handleStrikeChange} />
            <GameRounds
              game={game}
              roundMode={question.roundMode}
              winner={roundWinner}
              onWinner={handleOnWinner}
              onUndoWinner={handleOnUndoWinner}
              onRoundChange={handleOnRoundChange}
            />
          </Stack>
        </Grid>
      </Grid>
    )
  }

  function handleRevealChange(newReveal: boolean) {
    setRevealQuestion(newReveal)
  }
  function handleOnWinner(teamName: TeamName) {
    if (game && question) {
      const points = getAnsweredPoints(question.answers, question.roundMode)
      const team = game[teamName]

      team.points += points

      const newGame = { ...game, [teamName]: { ...team } }

      setGame(newGame)
      setRoundWinner(teamName)
    }
  }
  function handleOnUndoWinner(teamName: TeamName) {
    if (game && question) {
      const points = getAnsweredPoints(question.answers, question.roundMode)
      const team = game[teamName]

      team.points -= points

      const newGame = { ...game, [teamName]: { ...team } }

      setGame(newGame)
      setRoundWinner(undefined)
    }
  }
  function resetRound() {
    setRevealQuestion(false)
    setQuestion(undefined)
    setRoundWinner(undefined)
  }
  function handleCreateNewGame(newGame: Game) {
    judgeCache.remove('game')
    updateGame(newGame, true)
    setHasCachedGame(false)
    resetRound()

    if (channel) channel.publish(ABLY_EVENTS.NEW_GAME, newGame)
  }
  function handleLoadCacheGame() {
    const newGame = judgeCache.get('game') as Game

    if (newGame) {
      updateGame(newGame, true)
      setHasCachedGame(false)
    }
  }
  function handleDismissCachedGame() {
    judgeCache.remove('game')
    setHasCachedGame(false)
    resetRound()
  }
  function updateGame(newGame: Game, publish?: boolean) {
    setGame(newGame)
    judgeCache.set('game', newGame)

    if (publish && channel) {
      channel.publish(ABLY_EVENTS.GAME_CHANGE, newGame)
    }
  }
  function handleAnswerChange(answers: Answer[]) {
    if (question) {
      const newQuestion = { ...question, answers }

      const lastAnswered = question.answers.reduce((count, ans) => {
        return count + (ans.isAnswered ? 1 : 0)
      }, 0)
      const currentAnswered = answers.reduce((count, ans) => {
        return count + (ans.isAnswered ? 1 : 0)
      }, 0)
      const albyEvent =
        revealQuestion || lastAnswered > currentAnswered
          ? ABLY_EVENTS.QUESTION_CHANGE
          : ABLY_EVENTS.CORRECT_ANSWER

      setQuestion(newQuestion)

      if (channel) channel.publish(albyEvent, newQuestion)
    }
  }
  function handleStrikeChange(strikes: number, animate: boolean) {
    if (game) {
      const newGame = { ...game, strikes }
      updateGame(newGame, !animate)

      if (animate) {
        if (channel) channel.publish(ABLY_EVENTS.WRONG_ANSWER, newGame)
      }
    }
  }
  function handleOnRoundChange() {
    if (game) {
      const nextRound = game.roundsPlayed + 1

      if (game.totalRounds === nextRound) {
        judgeCache.remove('game')
        if (channel) channel.publish(ABLY_EVENTS.GAME_OVER, game)
        setGame(undefined)
        resetRound()
      } else {
        const newGame = { ...game, roundsPlayed: nextRound, strikes: 0 }

        if (channel) channel.publish(ABLY_EVENTS.NEW_ROUND, newGame)
        updateGame(newGame)
        resetRound()
      }
    }
  }
  function handleQuestionVisibilityChange(isVisible: boolean) {
    if (channel) channel.publish(ABLY_EVENTS.SHOW_QUESTION, { show: isVisible })
  }

  React.useEffect(() => {
    let _channel: Ably.Types.RealtimeChannelPromise | undefined

    if (gameChannel) {
      const ablyChannelName = getGameChannel(gameChannel)
      const ably: Ably.Types.RealtimePromise = configureAbly({
        authUrl: '/api/authentication/token-auth',
      })
      const _channel = ably.channels.get(ablyChannelName)

      _channel.subscribe(ABLY_EVENTS.PUBLISH_QUESITON, handleQuestionSubscription)

      setChannel(_channel)

      setHasCachedGame(!!judgeCache.get('game'))
    }

    return () => {
      if (_channel) _channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameChannel])

  return (
    <React.Fragment>
      <Head>
        <title>Post 91 Family Feud - Judge</title>
        <meta name='description' content='American Legion 91 Family Fued Judge View' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Container maxWidth='xl' sx={{ pt: 1, pb: '50px', minWidth: 300 }}>
        <Typography variant='h3' align='center'>
          Judge
        </Typography>
        <Divider sx={{ my: 1 }} />
        {hasCachedGame && (
          <Alert severity='warning' sx={{ '& .MuiAlert-message': { width: '100%' }, mb: 1 }}>
            There seems to be a cached game that was not completed. Would you like to load or
            dismiss it?
            <Box width='100%' display='flex' justifyContent='space-between'>
              <Button color='error' onClick={handleDismissCachedGame}>
                Dismiss
              </Button>
              <Button onClick={handleLoadCacheGame}>Load</Button>
            </Box>
          </Alert>
        )}
        {getLayout()}
        <GameChannelDialog
          open={!gameChannel}
          onSubmit={(newChannel, rememberMe) => {
            if (rememberMe) store.set(GAME_CHANNEL_KEY, newChannel)
            setGameChannel(newChannel)
          }}
        />
        <UpdateGameChannelDialog
          open={showEditChannelDialog}
          gameChannel={gameChannel ?? ''}
          onClose={() => setShowChannelEditDialog(false)}
          onSubmit={(newChannel, rememberMe) => {
            if (rememberMe) store.set(GAME_CHANNEL_KEY, newChannel)
            setGameChannel(newChannel)
          }}
        />
      </Container>
      {gameChannel && (
        <Fab
          variant='extended'
          size='small'
          color='primary'
          sx={{
            position: 'fixed',
            right: 8,
            bottom: 8,
          }}
          onClick={() => {
            setShowChannelEditDialog(true)
          }}
        >
          <BroadcastsIcon sx={{ mr: 1 }} />
          {gameChannel}
        </Fab>
      )}
    </React.Fragment>
  )
}
