import * as React from 'react'
import { ABLY_CHANNEL, ABLY_EVENTS, JUDGE_STORAGE_KEY } from '@/utility/constants'
import { configureAbly } from '@ably-labs/react-hooks'
import { getAnsweredPoints } from '@/utility/functions'
import * as Ably from 'ably'
import Head from 'next/head'
import store from 'store2'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import CloseIcon from '@mui/icons-material/Close'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Hidden from '@mui/material/Hidden'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Game, Team, RoundQuestion } from '@/types/types'
import CreateGame from '@/components/createGame'
import { FormControlLabel, Switch } from '@mui/material'

const judgeCache = store.namespace(JUDGE_STORAGE_KEY)

enum QUESTION_MODE {
  ANSWERING = 'answering',
  SHOWING = 'showing',
}
enum TEAM {
  ONE = 'teamOne',
  TWO = 'teamTwo',
}
enum MODE {
  CREATE = 'create',
  IN_ROUND = 'inRound',
  WAITING = 'waiting',
}

function TeamScoreCard({
  team,
  onRoundWon,
  disabled,
  hasWinner,
  isWinner,
  onUndo,
}: {
  disabled?: boolean
  hasWinner?: boolean
  isWinner?: boolean
  onRoundWon?: () => void
  onUndo?: () => void
  team: Team
}) {
  return (
    <Card
      sx={{
        minWidth: {
          xs: 275,
          md: 400,
        },
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Typography gutterBottom variant='h5' component='div'>
          Team {team.name} Score
        </Typography>
        <Box mx='auto' maxWidth={175}>
          <Paper
            variant='outlined'
            sx={{
              minHeight: 85,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant='h1' component='div'>
              {team.points}
            </Typography>
          </Paper>
        </Box>
      </CardContent>
      <CardActions>
        {!hasWinner && onRoundWon && (
          <Button onClick={onRoundWon} variant='outlined' disabled={disabled} fullWidth>
            Won Round
          </Button>
        )}
        {hasWinner && isWinner && (
          <Button onClick={onUndo} variant='outlined' disabled={disabled} fullWidth>
            Undo Win
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

function JudgeQuestion({
  question,
  disabled,
  onChange,
  onCorrect,
  mode = 'answering',
}: {
  question: RoundQuestion
  disabled?: boolean
  mode: 'answering' | 'showing'
  onChange?: (question: RoundQuestion) => void
  onCorrect?: (question: RoundQuestion) => void
}) {
  function toggelAnswered(index: number) {
    return () => {
      const answers = [...question.answers]
      const oldShow = answers[index].showAnswer
      const oldAnswered = answers[index].isAnswered
      const nextShowAnswer = !oldShow
      const nextIsAnswered = !oldAnswered
      let didChange = true

      if (mode === 'answering') {
        answers[index].isAnswered = !nextShowAnswer ? false : nextIsAnswered
        answers[index].showAnswer = nextShowAnswer
        didChange = answers[index].showAnswer !== oldShow

        if (didChange && nextShowAnswer && onCorrect) {
          onCorrect({ ...question, answers })
        } else if (didChange && onChange) {
          onChange({ ...question, answers })
        }
      } else {
        answers[index].showAnswer = true
        didChange = answers[index].showAnswer !== oldShow

        if (didChange && onChange) onChange({ ...question, answers })
      }
    }
  }

  return (
    <Stack spacing={1}>
      <Typography variant='h4' component='div' align='center'>
        Possible Points
      </Typography>
      <Paper variant='outlined' sx={{ p: 1 }}>
        <Typography variant='h4' component='div' align='center'>
          {getAnsweredPoints(question)}
        </Typography>
      </Paper>
      <Typography variant='h4' component='div' align='center'>
        Active Question
      </Typography>
      <Paper variant='outlined' sx={{ p: 2 }}>
        <Typography variant='h5' component='div'>
          {question.text}
        </Typography>
      </Paper>
      <Typography variant='h4' component='div' align='center'>
        Answers
      </Typography>
      <Paper variant='outlined'>
        <List dense disablePadding>
          {question.answers.map((a, i) => (
            <ListItem key={i} divider secondaryAction={a.points} disablePadding>
              <ListItemButton disabled={disabled} onClick={toggelAnswered(i)}>
                <ListItemIcon>
                  <Checkbox checked={a.showAnswer} edge='start' tabIndex={-1} disableRipple />
                </ListItemIcon>
                <ListItemText>{a.text}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Stack>
  )
}

function Winner({ game }: { game: Game }) {
  const name =
    game.teamOne.points > game.teamTwo.points
      ? game.teamOne.name
      : game.teamTwo.points > game.teamOne.points
      ? game.teamTwo.name
      : ''

  return (
    <Paper
      sx={{
        minHeight: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mt: 1,
      }}
    >
      <Typography variant='h3' component='div'>
        {name ? `Team ${name} Won` : 'Tie Game'}
      </Typography>
    </Paper>
  )
}

export default function Judge() {
  const [cachedGame, setCachedGame] = React.useState<Game>()
  const [channel, setChannel] = React.useState<Ably.Types.RealtimeChannelPromise | null>(null)
  const [disabledSoundEffects, setDisabledSoundEffects] = React.useState(false)
  const [game, setGame] = React.useState<Game>()
  const [mode, setMode] = React.useState<MODE>(MODE.CREATE)
  const [onDeckQuestion, setOnDeckQuestion] = React.useState<RoundQuestion>()
  const [question, setQuestion] = React.useState<RoundQuestion>()
  const [questionMode, setQuestionMode] = React.useState(QUESTION_MODE.ANSWERING)
  const [roundWinner, setRoundWinner] = React.useState<TEAM>()

  const handleQuestionSubscription = React.useCallback(
    (message: Ably.Types.Message) => {
      const newQuestion: RoundQuestion = message.data

      if (mode === MODE.IN_ROUND && question) {
        setOnDeckQuestion(newQuestion)
      } else if (mode === MODE.WAITING || !question) {
        setOnDeckQuestion(undefined)
        setQuestion(newQuestion)
        setMode(MODE.IN_ROUND)
      }
    },
    [mode, question],
  )

  function updateGame(game: Game, event?: ABLY_EVENTS) {
    setGame(game)
    judgeCache.set('game', game)

    if (channel && event) {
      channel.publish(event, game)
    }
  }

  function removeCacheGame() {
    setCachedGame(undefined)
    judgeCache.remove('game')
  }
  function loadCacheGame() {
    const newGame: Game = judgeCache.get('game')
    setCachedGame(undefined)
    setRoundWinner(undefined)

    if (question) {
      setMode(MODE.IN_ROUND)
    } else {
      setMode(MODE.WAITING)
    }

    updateGame(newGame, ABLY_EVENTS.GAME_CHANGE)
  }
  function handleDisabledSoundEffectChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target

    setDisabledSoundEffects(checked)
  }
  function handleRemoveStrike() {
    if (game) {
      const newGame: Game = { ...game, strikes: Math.max(game.strikes - 1, 0) }

      if (newGame.strikes < 4) setQuestionMode(QUESTION_MODE.ANSWERING)

      updateGame(newGame, ABLY_EVENTS.GAME_CHANGE)
    }
  }
  function handleAddStrike() {
    if (game) {
      const newGame: Game = { ...game, strikes: Math.min(game.strikes + 1, 4) }

      if (newGame.strikes === 4) setQuestionMode(QUESTION_MODE.SHOWING)

      if (channel) {
        if (questionMode === QUESTION_MODE.SHOWING || disabledSoundEffects) {
          updateGame(newGame, ABLY_EVENTS.GAME_CHANGE)
        } else {
          updateGame(newGame, ABLY_EVENTS.WRONG_ANSWER)
        }
      }
    }
  }
  function handleLoadOnDeckIntoCurrentRound() {
    if (onDeckQuestion) {
      const newQuestion = { ...onDeckQuestion }

      setQuestion(newQuestion)
      setOnDeckQuestion(undefined)

      if (game) {
        const newGame = { ...game, strikes: 0 }
        setRoundWinner(undefined)
        setQuestionMode(QUESTION_MODE.ANSWERING)

        updateGame(newGame, ABLY_EVENTS.GAME_CHANGE)
      }
    }
  }
  function handleCreateNewGame(newGame: Game) {
    setMode(question ? MODE.IN_ROUND : MODE.WAITING)
    updateGame(newGame, ABLY_EVENTS.NEW_ROUND)
  }
  function handleQuestionChange(newQuestion: RoundQuestion) {
    setQuestion(newQuestion)

    if (channel) channel.publish(ABLY_EVENTS.QUESTION_CHANGE, newQuestion)
  }
  function handleCorrectAnswer(newQuestion: RoundQuestion) {
    setQuestion(newQuestion)

    if (game?.strikes === 3) setQuestionMode(QUESTION_MODE.SHOWING)

    if (channel)
      channel.publish(
        disabledSoundEffects ? ABLY_EVENTS.QUESTION_CHANGE : ABLY_EVENTS.CORRECT_ANSWER,
        newQuestion,
      )
  }
  function handleTeamOneWon() {
    if (!game) return
    const roundPoints = getAnsweredPoints(question)
    const teamOne = { ...game.teamOne }

    teamOne.points += roundPoints

    updateGame({ ...game, teamOne })
    setRoundWinner(TEAM.ONE)
  }
  function handleTeamTwoWon() {
    if (!game) return
    const roundPoints = getAnsweredPoints(question)
    const teamTwo = { ...game.teamTwo }

    teamTwo.points += roundPoints

    updateGame({ ...game, teamTwo })
    setRoundWinner(TEAM.TWO)
  }
  function handleRoundUndo(team: TEAM) {
    return () => {
      if (!game) return
      const points = game[team].points - getAnsweredPoints(question)

      updateGame({ ...game, [team]: { ...game[team], points } })
      setRoundWinner(undefined)
    }
  }
  function handelNextRound() {
    if (!game) return
    const newGame = { ...game, roundsPlayed: game.roundsPlayed + 1, strikes: 0 }

    setRoundWinner(undefined)

    if (onDeckQuestion) {
      setQuestion(onDeckQuestion)
      setOnDeckQuestion(undefined)
      setMode(MODE.IN_ROUND)
    } else {
      setQuestion(undefined)
      setOnDeckQuestion(undefined)
      setMode(MODE.WAITING)
    }
    setQuestionMode(QUESTION_MODE.ANSWERING)

    updateGame(newGame, ABLY_EVENTS.NEW_ROUND)
  }
  function handleShowQuesitonOnBoard() {
    if (channel) channel.publish(ABLY_EVENTS.SHOW_QUESTION, { show: true })
  }
  function handleHideQuesitonOnBoard() {
    if (channel) channel.publish(ABLY_EVENTS.SHOW_QUESTION, { show: false })
  }

  React.useEffect(() => {
    const ably: Ably.Types.RealtimePromise = configureAbly({
      authUrl: '/api/authentication/token-auth',
    })
    const _channel = ably.channels.get(ABLY_CHANNEL)
    const gameFromCache: Game = judgeCache.get('game')

    _channel.subscribe(ABLY_EVENTS.QUESTION_CHANGE, handleQuestionSubscription)
    setChannel(_channel)

    if (gameFromCache) setCachedGame(gameFromCache)

    return () => {
      _channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>Post 91 Family Feud - Judge</title>
        <meta name='description' content='American Legion 91 Family Fued Judge View' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Container maxWidth='xl' sx={{ pb: 2 }}>
        <Typography variant='h1' align='center'>
          Judge
        </Typography>
        <Divider sx={{ mt: 1 }} />
        {mode !== MODE.CREATE && game && (
          <React.Fragment>
            {game.roundsPlayed < game.totalRounds ? (
              <Stack spacing={1}>
                {onDeckQuestion && (
                  <Alert severity='info'>
                    <Typography>
                      A new question was recieved from the host. Please proceed to the next round to
                      load it.
                    </Typography>
                    <Typography variant='caption'>
                      Or click the button below to load it in the current round. This action will
                      reset the current round.
                    </Typography>
                    <Box>
                      <Button fullWidth onClick={handleLoadOnDeckIntoCurrentRound}>
                        Load Now
                      </Button>
                    </Box>
                  </Alert>
                )}
                <Paper sx={{ mt: 1, p: 1 }}>
                  <Typography variant='h4' component='div' align='center'>
                    Round {game.roundsPlayed + 1} of {game.totalRounds}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box display='flex' justifyContent='center'>
                    <Button variant='outlined' onClick={handelNextRound} fullWidth>
                      Next Round
                    </Button>
                  </Box>
                </Paper>
                <Box>
                  <Hidden smDown>
                    <Box display='flex' justifyContent='space-evenly'>
                      <TeamScoreCard
                        team={game.teamOne}
                        onRoundWon={mode !== MODE.WAITING ? handleTeamOneWon : undefined}
                        hasWinner={!!roundWinner}
                        isWinner={roundWinner === TEAM.ONE}
                        onUndo={handleRoundUndo(TEAM.ONE)}
                      />
                      <TeamScoreCard
                        team={game.teamTwo}
                        onRoundWon={mode !== MODE.WAITING ? handleTeamTwoWon : undefined}
                        hasWinner={!!roundWinner}
                        isWinner={roundWinner === TEAM.TWO}
                        onUndo={handleRoundUndo(TEAM.TWO)}
                      />
                    </Box>
                  </Hidden>
                  <Hidden smUp>
                    <Stack spacing={1}>
                      <TeamScoreCard
                        team={game.teamOne}
                        onRoundWon={mode !== MODE.WAITING ? handleTeamOneWon : undefined}
                        hasWinner={!!roundWinner}
                        isWinner={roundWinner === TEAM.ONE}
                        onUndo={handleRoundUndo(TEAM.ONE)}
                      />
                      <TeamScoreCard
                        team={game.teamTwo}
                        onRoundWon={mode !== MODE.WAITING ? handleTeamTwoWon : undefined}
                        hasWinner={!!roundWinner}
                        isWinner={roundWinner === TEAM.TWO}
                        onUndo={handleRoundUndo(TEAM.TWO)}
                      />
                    </Stack>
                  </Hidden>
                </Box>
                <Divider />
                {question ? (
                  <Paper sx={{ p: 1 }}>
                    <JudgeQuestion
                      question={question}
                      onCorrect={handleCorrectAnswer}
                      onChange={handleQuestionChange}
                      mode={questionMode}
                    />
                    <Divider sx={{ my: 1 }} />
                    <Box display='flex' justifyContent='space-between'>
                      <Button
                        disabled={game.strikes <= 0}
                        variant='outlined'
                        onClick={handleRemoveStrike}
                      >
                        Remove
                      </Button>
                      <Box display='flex' alignItems='center' gap={0.5}>
                        <CloseIcon
                          sx={{
                            color: game.strikes >= 1 ? '#d32f2f' : '#424242',
                            border: `1px solid ${game.strikes >= 1 ? '#d32f2f' : '#424242'}`,
                            borderRadius: '2px',
                            fontSize: {
                              xs: 20,
                              sm: 35,
                            },
                          }}
                        />
                        <CloseIcon
                          sx={{
                            color: game.strikes >= 2 ? '#d32f2f' : '#424242',
                            border: `1px solid ${game.strikes >= 2 ? '#d32f2f' : '#424242'}`,
                            borderRadius: '2px',
                            fontSize: {
                              xs: 20,
                              sm: 35,
                            },
                          }}
                        />
                        <CloseIcon
                          sx={{
                            color: game.strikes >= 3 ? '#d32f2f' : '#424242',
                            border: `1px solid ${game.strikes >= 3 ? '#d32f2f' : '#424242'}`,
                            borderRadius: '2px',
                            fontSize: {
                              xs: 20,
                              sm: 35,
                            },
                          }}
                        />
                        <CloseIcon
                          sx={{
                            color: game.strikes >= 4 ? '#d32f2f' : '#424242',
                            border: `1px solid ${game.strikes >= 4 ? '#d32f2f' : '#424242'}`,
                            borderRadius: '2px',
                            fontSize: {
                              xs: 20,
                              sm: 35,
                            },
                          }}
                        />
                      </Box>
                      <Button
                        disabled={game.strikes >= 4}
                        color='error'
                        variant='outlined'
                        onClick={handleAddStrike}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box pt={1}>
                      <Button onClick={handleShowQuesitonOnBoard} fullWidth>
                        Show Question on Board
                      </Button>
                    </Box>
                    <Box pt={1}>
                      <Button onClick={handleHideQuesitonOnBoard} fullWidth>
                        Hide Question on Board
                      </Button>
                    </Box>
                    <Box pt={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={disabledSoundEffects}
                            onChange={handleDisabledSoundEffectChange}
                          />
                        }
                        label='Disabled Sound Effects'
                      />
                    </Box>
                  </Paper>
                ) : (
                  <Box>
                    <Typography variant='h5' component='div'>
                      Waiting for the next Question
                    </Typography>
                  </Box>
                )}
              </Stack>
            ) : (
              <Winner game={game} />
            )}
          </React.Fragment>
        )}
        {(mode === MODE.CREATE || !game) && (
          <Stack>
            {cachedGame && (
              <Alert severity='warning' sx={{ mt: 1 }}>
                <Typography paragraph>
                  There seems to be a cached game. This may be the result of the browser closing
                  accidently.
                </Typography>
                <Typography>Would you like to load the previous game from the cache?</Typography>
                <Box display='flex'>
                  <Box flexGrow={1} />
                  <Button onClick={removeCacheGame}>No</Button>
                  <Button onClick={loadCacheGame}>Yes</Button>
                </Box>
              </Alert>
            )}
            <CreateGame
              onExit={game ? () => setMode(MODE.IN_ROUND) : undefined}
              onCreate={handleCreateNewGame}
            />
          </Stack>
        )}
      </Container>
    </React.Fragment>
  )
}
