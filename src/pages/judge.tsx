import * as React from 'react'
import { ABLY_CHANNEL, ABLY_EVENTS, HOST_STORAGE_KEY, JUDGE_STORAGE_KEY } from '@/utility/constants'
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
import FormControl from '@mui/material/FormControl'
import Hidden from '@mui/material/Hidden'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { Question, Game, Team } from '@/types/types'

const judgeCache = store.namespace(JUDGE_STORAGE_KEY)

enum MODE {
  DEFAULT = 'default',
  CREATE = 'create',
}

const BASE_GAME = {
  teamOne: {
    name: '',
    points: 0,
  },
  teamTwo: {
    name: '',
    points: 0,
  },
  totalRounds: 5,
  stikes: 0,
}

function TeamScoreCard({
  team,
  onRoundWon,
  disabled,
}: {
  team: Team
  disabled?: boolean
  onRoundWon?: (team: Team) => void
}) {
  function handleRoundWon(team: Team) {
    return () => {
      if (onRoundWon) onRoundWon(team)
    }
  }
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
        <Button onClick={handleRoundWon(team)} variant='outlined' disabled={disabled} fullWidth>
          Won Round
        </Button>
      </CardActions>
    </Card>
  )
}

function JudgeQuestion({
  question,
  disabled,
  onChange,
}: {
  question: Question
  disabled?: boolean
  onChange?: (question: Question) => void
}) {
  function toggelAnswered(index: number) {
    return () => {
      const answers = [...question.answers]
      answers[index].isAnswered = !answers[index].isAnswered

      if (onChange) onChange({ ...question, answers })
    }
  }

  return (
    <Stack spacing={1}>
      <Typography variant='h4' component='div' align='center'>
        Possible Points
      </Typography>
      <Typography variant='h4' component='div' align='center'>
        {getAnsweredPoints(question)}
      </Typography>
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
      <List dense>
        {question.answers.map((a, i) => (
          <ListItem key={i} divider secondaryAction={a.points} disablePadding>
            <ListItemButton disabled={disabled} onClick={toggelAnswered(i)}>
              <ListItemIcon>
                <Checkbox checked={a.isAnswered} edge='start' tabIndex={-1} disableRipple />
              </ListItemIcon>
              <ListItemText>{a.text}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
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
  const [channel, setChannel] = React.useState<Ably.Types.RealtimeChannelPromise | null>(null)
  const [game, setGame] = React.useState<Game>()
  const [mode, setMode] = React.useState(MODE.DEFAULT)
  const [question, setQuestion] = React.useState<Question>()
  const [hasCachedGame, setHasCachedGame] = React.useState(false)
  const [currentRound, setCurrentRound] = React.useState(0)

  function handleCreateGame() {
    setMode(MODE.CREATE)
    setGame({ ...BASE_GAME })
  }
  function handleCreateGameSubmit() {
    startGame()
    updateGame(game)
  }
  function handleTotalRoundChange(event: SelectChangeEvent) {
    const prevGame = game ? game : { ...BASE_GAME }

    setGame({ ...prevGame, totalRounds: parseInt(event.target.value as string) })
  }
  function handleReset(resetGame: boolean) {
    return () => {
      setMode(MODE.DEFAULT)
      if (resetGame) updateGame()
    }
  }
  function handleTeamOneWon() {
    let newGame: Game | null = null

    if (question && game) {
      const points = getAnsweredPoints(question) + game.teamOne.points
      newGame = { ...game, teamOne: { ...game.teamOne, points } }
    } else if (game) {
      setCurrentRound(currentRound + 1)
      setQuestion(undefined)
    }

    if (newGame) nextRound(newGame)
  }
  function handleTeamTwoWon() {
    let newGame: Game | null = null

    if (question && game) {
      const points = getAnsweredPoints(question) + game.teamTwo.points
      newGame = { ...game, teamTwo: { ...game.teamTwo, points } }
    } else if (game) {
      setCurrentRound(currentRound + 1)
      setQuestion(undefined)
    }

    if (newGame) nextRound(newGame)
  }
  function handleRemoveStrike() {
    if (!game) return
    const newGame = { ...game, stikes: Math.max(game.stikes - 1, 0) }

    updateGame(newGame)
  }
  function handleAddStrike() {
    if (!game) return
    const newGame = { ...game, stikes: Math.min(game.stikes + 1, 3) }

    updateGame(newGame)
  }

  function handleQuestionChange(q: Question) {
    setQuestion(q)

    if (channel) channel.publish(ABLY_EVENTS.QUESTION_CHANGE, q)
  }

  function startGame() {
    setHasCachedGame(false)
    setMode(MODE.DEFAULT)
    setCurrentRound(1)
  }
  function nextRound(newGame: Game) {
    setCurrentRound(currentRound + 1)
    setQuestion(undefined)
    updateGame(newGame)
  }
  function updateGame(newGame?: Game) {
    setGame(newGame)
    if (newGame) {
      judgeCache.set('game', newGame)
    } else {
      judgeCache.remove('game')
    }
    if (channel) {
      channel.publish(ABLY_EVENTS.GAME_CHANGE, newGame)
    }
  }

  React.useEffect(() => {
    const ably: Ably.Types.RealtimePromise = configureAbly({
      authUrl: '/api/authentication/token-auth',
    })
    const _channel = ably.channels.get(ABLY_CHANNEL)
    _channel.subscribe(ABLY_EVENTS.QUESTION_CHANGE, (message: Ably.Types.Message) => {
      const newQuestion: Question = message.data

      setQuestion(newQuestion)
    })
    setChannel(_channel)

    if (!!judgeCache.get('game')) setHasCachedGame(true)

    return () => {
      _channel.unsubscribe()
    }
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
        {mode === MODE.DEFAULT && !game && (
          <Box my={1}>
            {hasCachedGame && (
              <Alert severity='warning'>
                <Typography paragraph>
                  There seems to be a cached game. This may be the result of the browser closing
                  accidently.
                </Typography>
                <Typography>Would you like to load the previous game from the cache?</Typography>
                <Box display='flex'>
                  <Box flexGrow={1} />
                  <Button
                    onClick={() => {
                      setHasCachedGame(false)
                      judgeCache.remove('game')
                    }}
                  >
                    No
                  </Button>
                  <Button
                    onClick={() => {
                      setGame(judgeCache.get('game'))
                      startGame()
                    }}
                  >
                    Yes
                  </Button>
                </Box>
              </Alert>
            )}
            <Typography paragraph>
              You haven&apos;t create a game yet. Use the button below to create a new game.
            </Typography>
            <Button variant='outlined' onClick={handleCreateGame} fullWidth>
              Create Game
            </Button>
          </Box>
        )}
        {mode === MODE.DEFAULT && game && (
          <React.Fragment>
            {currentRound - 1 < game.totalRounds ? (
              <Stack spacing={1}>
                <Typography sx={{ mt: 1 }} variant='h4' component='div' align='center'>
                  Round {currentRound} of {game.totalRounds}
                </Typography>
                <Box>
                  <Hidden smDown>
                    <Box display='flex' justifyContent='space-evenly' mt={2}>
                      <TeamScoreCard team={game.teamOne} onRoundWon={handleTeamOneWon} />
                      <TeamScoreCard team={game.teamTwo} onRoundWon={handleTeamTwoWon} />
                    </Box>
                  </Hidden>
                  <Hidden smUp>
                    <Stack sx={{ mt: 2 }} spacing={2}>
                      <TeamScoreCard team={game.teamOne} onRoundWon={handleTeamOneWon} />
                      <TeamScoreCard team={game.teamTwo} onRoundWon={handleTeamTwoWon} />
                    </Stack>
                  </Hidden>
                </Box>
                <Divider />
                {question && (
                  <Box>
                    <JudgeQuestion
                      question={question}
                      disabled={game.stikes >= 3}
                      onChange={handleQuestionChange}
                    />
                    <Box display='flex' justifyContent='space-between'>
                      <Button
                        disabled={game.stikes <= 0}
                        variant='outlined'
                        onClick={handleRemoveStrike}
                      >
                        Remove Strike
                      </Button>
                      <Box display='flex' alignItems='center' gap={0.5}>
                        <CloseIcon
                          sx={{
                            color: game.stikes >= 1 ? '#d32f2f' : '#424242',
                            border: `1px solid ${game.stikes >= 1 ? '#d32f2f' : '#424242'}`,
                            borderRadius: '2px',
                            fontSize: {
                              xs: 20,
                              sm: 35,
                            },
                          }}
                        />
                        <CloseIcon
                          sx={{
                            color: game.stikes >= 2 ? '#d32f2f' : '#424242',
                            border: `1px solid ${game.stikes >= 2 ? '#d32f2f' : '#424242'}`,
                            borderRadius: '2px',
                            fontSize: {
                              xs: 20,
                              sm: 35,
                            },
                          }}
                        />
                        <CloseIcon
                          sx={{
                            color: game.stikes >= 3 ? '#d32f2f' : '#424242',
                            border: `1px solid ${game.stikes >= 3 ? '#d32f2f' : '#424242'}`,
                            borderRadius: '2px',
                            fontSize: {
                              xs: 20,
                              sm: 35,
                            },
                          }}
                        />
                      </Box>
                      <Button
                        disabled={game.stikes >= 3}
                        color='error'
                        variant='outlined'
                        onClick={handleAddStrike}
                      >
                        Add Strike
                      </Button>
                    </Box>
                  </Box>
                )}
                {!question && (
                  <Box>
                    <Typography variant='h5' component='div'>
                      Waiting for the next Question
                    </Typography>
                  </Box>
                )}
                {!question && <Divider />}
              </Stack>
            ) : (
              <Winner game={game} />
            )}
            <Button sx={{ mt: 5 }} variant='outlined' onClick={handleCreateGame} fullWidth>
              New Game
            </Button>
          </React.Fragment>
        )}
        {mode === MODE.CREATE && !!game && (
          <React.Fragment>
            <Paper sx={{ mt: 1, p: 2 }}>
              <Stack spacing={2}>
                <TextField
                  label='Team One Name'
                  value={game.teamOne.name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const { value: name } = event.target
                    setGame({
                      ...game,
                      teamOne: { ...game.teamOne, name },
                    })
                  }}
                />
                <TextField
                  label='Team One Points'
                  value={game.teamOne.points}
                  error={isNaN(parseInt(`${game.teamOne.points}`))}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const { value } = event.target
                    const points = parseInt(value)

                    setGame({
                      ...game,
                      teamOne: {
                        ...game.teamOne,
                        points: isNaN(points) ? (value as unknown as number) : points,
                      },
                    })
                  }}
                />
                <TextField
                  label='Team Two Name'
                  value={game.teamTwo.name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const { value: name } = event.target
                    setGame({
                      ...game,
                      teamTwo: { ...game.teamTwo, name },
                    })
                  }}
                />
                <TextField
                  label='Team Two Points'
                  value={game.teamTwo.points}
                  error={isNaN(parseInt(`${game.teamTwo.points}`))}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const { value } = event.target
                    const points = parseInt(value)

                    setGame({
                      ...game,
                      teamTwo: {
                        ...game.teamTwo,
                        points: isNaN(points) ? (value as unknown as number) : points,
                      },
                    })
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel id='total-rounds-label'>Total Rounds</InputLabel>
                  <Select
                    labelId='total-rounds-label'
                    id='total-rounds'
                    value={`${game.totalRounds}`}
                    label='Total Rounds'
                    onChange={handleTotalRoundChange}
                  >
                    <MenuItem value={1}>One</MenuItem>
                    <MenuItem value={2}>Two</MenuItem>
                    <MenuItem value={3}>Three</MenuItem>
                    <MenuItem value={4}>Four</MenuItem>
                    <MenuItem value={5}>Five</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Paper>
            <Box sx={{ mt: 2 }} display='flex' justifyContent='space-between'>
              <Button onClick={handleReset(true)}>Cancel</Button>
              <Button
                variant='contained'
                onClick={handleCreateGameSubmit}
                disabled={
                  !game.teamOne.name ||
                  !game.teamTwo.name ||
                  isNaN(parseInt(`${game.teamOne.points}`)) ||
                  isNaN(parseInt(`${game.teamTwo.points}`))
                }
              >
                Create Game
              </Button>
            </Box>
          </React.Fragment>
        )}
      </Container>
    </React.Fragment>
  )
}
