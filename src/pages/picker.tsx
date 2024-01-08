import * as React from 'react'
import * as Ably from 'ably'
import Head from 'next/head'
import { configureAbly } from '@ably-labs/react-hooks'
import { ABLY_EVENTS, GAME_CHANNEL_KEY, MUSIC, ROUND_MODE } from '@/utility/constants'

import {
  Alert,
  Box,
  Button,
  Container,
  Fab,
  Paper,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Zoom,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Grid,
} from '@mui/material'
import QuestionList from '@/components/questionList'
import QuestionCart from '@/components/questionCart'
import AddIcon from '@mui/icons-material/Add'
import Pagination from '@mui/material/Pagination'
import BroadcastsIcon from '@mui/icons-material/Podcasts'
import UpdateGameChannelDialog from '@/components/UpdateGameChannelDialog'
import type { ListQuestion, Question } from '@/types/types'
import store from 'store2'
import { getGameChannel } from '@/utility/functions'
import GameChannelDialog from '@/components/GameChannelDialog'

enum PICKER_MODE {
  BY_TERM = 'term',
  BY_ANSWERS = 'answer',
}
enum PICKER_VIEW {
  SEARCH = 'search',
  CART = 'cart',
}
enum NUM_ANSWER {
  ANY = 'any',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
}

enum MAX_PAGES {
  ANY = 218,
  THREE = 13,
  FOUR = 55,
  FIVE = 59,
  SIX = 59,
  SEVEN = 42,
}

const ENDPOINT = '/api/questions'

export default function Picker() {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [gameChannel, setGameChannel] = React.useState<string | null>(store.get(GAME_CHANNEL_KEY))
  const [showEditChannelDialog, setShowChannelEditDialog] = React.useState(false)
  const [channel, setChannel] = React.useState<Ably.Types.RealtimeChannelPromise>()
  const [mode, setMode] = React.useState(PICKER_MODE.BY_ANSWERS)
  const [view, setView] = React.useState(PICKER_VIEW.SEARCH)
  const [page, setPage] = React.useState(1)
  const [numAnswer, setNumAnswer] = React.useState(NUM_ANSWER.ANY)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [fetching, setFetching] = React.useState(false)
  const [questionPool, setQuesitonPool] = React.useState<ListQuestion[]>()
  const [cartQuestions, setCartQuestions] = React.useState<ListQuestion[]>([])
  const maxPages = React.useMemo(() => {
    switch (numAnswer) {
      case NUM_ANSWER.THREE:
        return MAX_PAGES.THREE
      case NUM_ANSWER.FOUR:
        return MAX_PAGES.FOUR
      case NUM_ANSWER.FIVE:
        return MAX_PAGES.FIVE
      case NUM_ANSWER.SIX:
        return MAX_PAGES.SIX
      case NUM_ANSWER.SEVEN:
        return MAX_PAGES.SEVEN
      default:
        return MAX_PAGES.ANY
    }
  }, [numAnswer])
  const hasSelectedPoolQuestion = React.useMemo(() => {
    return questionPool ? questionPool.some((q) => q.selected) : false
  }, [questionPool])
  function handleModeChange(event: React.MouseEvent<HTMLElement>, newMode: PICKER_MODE | null) {
    if (newMode) {
      setMode(newMode)
      setQuesitonPool(undefined)
      setPage(1)
      setSearchTerm('')
      setNumAnswer(NUM_ANSWER.ANY)
    }
  }
  function handleNumAnswerChange(
    event: React.MouseEvent<HTMLElement>,
    newAnswer: NUM_ANSWER | null,
  ) {
    if (newAnswer) {
      setNumAnswer(newAnswer)
      setPage(1)
    }
  }
  function handleSearchTermChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value)
  }
  function handleSearchKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') handleGetQuestions()
  }
  function handleGetQuestions(query?: { [key: string]: string }) {
    let params = { ...query }

    if (mode === PICKER_MODE.BY_TERM && searchTerm) {
      params = { ...params, q: searchTerm }
    } else if (mode === PICKER_MODE.BY_ANSWERS && numAnswer !== NUM_ANSWER.ANY) {
      params = { ...params, answerCount: numAnswer }
    }

    fetchQuestions(params)
  }
  function handleShowQuestionAnswerToggle(questionIndex: number) {
    if (!questionPool) return
    const newQuestions = [...questionPool]
    const q = questionPool[questionIndex]

    q.showAnswers = !q.showAnswers

    setQuesitonPool(newQuestions)
  }
  function handleSelectedQuestionToggle(questionIndex: number) {
    if (!questionPool) return
    const newQuestions = [...questionPool]
    const q = questionPool[questionIndex]

    q.selected = !q.selected

    setQuesitonPool(newQuestions)
  }
  function handleAddQuestionToCart() {
    if (!questionPool) return
    const selectedQuestion = questionPool.filter((q) => q.selected)
    const cartTexts = cartQuestions.map((q) => q.text)
    const newCart = [...cartQuestions]

    selectedQuestion.forEach((q) => {
      if (!cartTexts.includes(q.text)) {
        newCart.push({ ...q, showAnswers: false, active: false, selected: false })
      }
    })

    const newPool = questionPool.map((q) => ({ ...q, selected: false, showAnswers: false }))
    setQuesitonPool(newPool)

    const activeQuesiton = newCart.find((q) => q.active)

    if (activeQuesiton) {
      const tempCart = newCart.filter((q) => !q.active)

      setCartQuestions([activeQuesiton, ...tempCart.slice(-4)])
    } else {
      setCartQuestions(newCart.slice(-5))
    }
  }
  function handleToggleView() {
    setView((prev) => (prev === PICKER_VIEW.SEARCH ? PICKER_VIEW.CART : PICKER_VIEW.SEARCH))
  }
  function handlePublishCartQuestion(index: number) {
    const newCart = cartQuestions.map((q) => ({ ...q, active: false }))
    const q = newCart[index]
    q.active = true

    setCartQuestions(newCart)
  }
  function handleRemoveCartQuestion(index: number) {
    const newCart = [...cartQuestions]

    newCart.splice(index, 1)
    setCartQuestions(newCart)

    if (newCart.length === 0) setView(PICKER_VIEW.SEARCH)
  }
  function handlePageChange(event: React.ChangeEvent<unknown>, newPage: number) {
    setPage(newPage)
    handleGetQuestions({ page: `${newPage}` })
  }

  function handlePlayMusic(music: MUSIC) {
    return () => {
      if (channel) {
        channel.publish(ABLY_EVENTS.PLAY_MUSIC, { music })
      }
    }
  }
  function handleStopMusic() {
    if (channel) {
      channel.publish(ABLY_EVENTS.STOP_MUSIC, {})
    }
  }

  async function fetchQuestions(query: { [key: string]: string }) {
    try {
      setFetching(true)
      const url = new URL(`${location.origin}${ENDPOINT}`)

      if (Object.keys(query).length) {
        url.search = new URLSearchParams(query).toString()
      }

      const response = await fetch(url)
      const data: Question[] = await response.json()

      setQuesitonPool(data.map((q) => ({ ...q, roundMode: ROUND_MODE.NORMAL })))
    } finally {
      setFetching(false)
    }
  }

  React.useEffect(() => {
    let _channel: Ably.Types.RealtimeChannelPromise | undefined

    if (gameChannel) {
      const ablyChannelName = getGameChannel(gameChannel)
      const ably: Ably.Types.RealtimePromise = configureAbly({
        authUrl: '/api/authentication/token-auth',
      })
      _channel = ably.channels.get(ablyChannelName)
      setChannel(_channel)
    }

    return () => {
      if (_channel) _channel.unsubscribe()
    }
  }, [gameChannel])

  if (!channel)
    return (
      <GameChannelDialog
        open={!gameChannel}
        onSubmit={(newChannel, rememberMe) => {
          if (rememberMe) store.set(GAME_CHANNEL_KEY, newChannel)
          setGameChannel(newChannel)
        }}
      />
    )

  return (
    <React.Fragment>
      <Head>
        <title>Post 91 Family Feud - Question Picker</title>
        <meta name='description' content='American Legion 91 Family Fued Question Picker View' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Container maxWidth='xl' sx={{ pt: 1, pb: '50px', minWidth: 300 }}>
        <Stack spacing={1} sx={{ pb: hasSelectedPoolQuestion ? 6 : 0 }}>
          {view === PICKER_VIEW.SEARCH ? (
            <React.Fragment>
              <Paper sx={{ p: 1 }}>
                <Stack spacing={1.5}>
                  {isSmall ? (
                    <React.Fragment>
                      <ToggleButtonGroup
                        exclusive
                        value={mode}
                        onChange={handleModeChange}
                        fullWidth
                        size='small'
                      >
                        <ToggleButton value={PICKER_MODE.BY_ANSWERS}>By # of Answers</ToggleButton>
                        <ToggleButton value={PICKER_MODE.BY_TERM}>By Search Term</ToggleButton>
                      </ToggleButtonGroup>
                      {mode === PICKER_MODE.BY_TERM && (
                        <TextField
                          value={searchTerm}
                          onChange={handleSearchTermChange}
                          onKeyDown={handleSearchKeyPress}
                          label='Search'
                          size='small'
                          autoFocus
                          fullWidth
                        />
                      )}
                      {mode === PICKER_MODE.BY_ANSWERS && (
                        <ToggleButtonGroup
                          exclusive
                          value={numAnswer}
                          onChange={handleNumAnswerChange}
                          fullWidth
                        >
                          <ToggleButton value={NUM_ANSWER.ANY}>Any</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.THREE}>3</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.FOUR}>4</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.FIVE}>5</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.SIX}>6</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.SEVEN}>7</ToggleButton>
                        </ToggleButtonGroup>
                      )}
                    </React.Fragment>
                  ) : (
                    <Box display='flex' gap={2}>
                      <ToggleButtonGroup
                        exclusive
                        value={mode}
                        onChange={handleModeChange}
                        fullWidth
                      >
                        <ToggleButton value={PICKER_MODE.BY_ANSWERS}>By # of Answers</ToggleButton>
                        <ToggleButton value={PICKER_MODE.BY_TERM}>By Search Term</ToggleButton>
                      </ToggleButtonGroup>
                      {mode === PICKER_MODE.BY_TERM && (
                        <TextField
                          value={searchTerm}
                          onChange={handleSearchTermChange}
                          onKeyDown={handleSearchKeyPress}
                          label='Search'
                          autoFocus
                          fullWidth
                        />
                      )}
                      {mode === PICKER_MODE.BY_ANSWERS && (
                        <ToggleButtonGroup
                          exclusive
                          value={numAnswer}
                          onChange={handleNumAnswerChange}
                          fullWidth
                        >
                          <ToggleButton value={NUM_ANSWER.ANY}>Any</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.THREE}>3</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.FOUR}>4</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.FIVE}>5</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.SIX}>6</ToggleButton>
                          <ToggleButton value={NUM_ANSWER.SEVEN}>7</ToggleButton>
                        </ToggleButtonGroup>
                      )}
                    </Box>
                  )}
                  <Button onClick={() => handleGetQuestions()} variant='outlined'>
                    Find Questions
                  </Button>
                  {!!cartQuestions.length && (
                    <Button onClick={handleToggleView} variant='outlined'>
                      View Quesiton Cart - {cartQuestions.length}
                    </Button>
                  )}
                </Stack>
              </Paper>
              {questionPool && !!questionPool.length && (
                <Alert severity='info'>
                  Please note that the question cart can only hold 5 questions at a time. Therefore
                  it will only keep the last 5 selected questions.
                </Alert>
              )}
            </React.Fragment>
          ) : (
            <Paper sx={{ p: 1 }}>
              <Stack spacing={1}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      onClick={handlePlayMusic(MUSIC.GUNSMOKE_OPEN)}
                      variant='outlined'
                      fullWidth
                    >
                      Play Gunsmoke Theme
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      onClick={handlePlayMusic(MUSIC.GUNSMOKE_END)}
                      variant='outlined'
                      fullWidth
                    >
                      Play Gunsmoke Closing Theme
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      onClick={handlePlayMusic(MUSIC.GUNSMOKE_NEXT)}
                      variant='outlined'
                      fullWidth
                    >
                      Play Gunsmoke Stay Tuned
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button onClick={handleStopMusic} variant='outlined' fullWidth>
                      Stop Music
                    </Button>
                  </Grid>
                </Grid>

                <Button onClick={handleToggleView} variant='outlined' fullWidth>
                  Search for Questions
                </Button>
              </Stack>
            </Paper>
          )}

          {fetching ? (
            <LinearProgress />
          ) : view === PICKER_VIEW.SEARCH && questionPool ? (
            <React.Fragment>
              <Paper>
                {questionPool.length === 0 && (
                  <Typography align='center' sx={{ m: 2 }}>
                    No quesiton found for the current query
                  </Typography>
                )}
                <QuestionList
                  questions={questionPool}
                  onShowAnswersToggle={handleShowQuestionAnswerToggle}
                  onSelectToggle={handleSelectedQuestionToggle}
                />
              </Paper>
              {!!questionPool.length && (
                <Box display='flex' justifyContent='center'>
                  <Pagination
                    page={page}
                    count={questionPool.length < 15 ? page : maxPages}
                    onChange={handlePageChange}
                    boundaryCount={view === PICKER_VIEW.SEARCH && searchTerm ? 0 : 1}
                  />
                </Box>
              )}
            </React.Fragment>
          ) : view === PICKER_VIEW.CART ? (
            <QuestionCart
              channel={channel}
              questions={cartQuestions}
              onPublish={handlePublishCartQuestion}
              onRemove={handleRemoveCartQuestion}
            />
          ) : (
            <div>Please use the controls above to find quesitons</div>
          )}
        </Stack>
        <Zoom in={hasSelectedPoolQuestion}>
          <Box position='fixed' bottom={8} right={16}>
            <Fab
              variant='extended'
              color='primary'
              aria-label='add'
              onClick={handleAddQuestionToCart}
            >
              <AddIcon sx={{ mr: 1 }} />
              Add
            </Fab>
          </Box>
        </Zoom>
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
            left: 8,
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
