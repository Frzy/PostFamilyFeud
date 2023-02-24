import * as React from 'react'
import { configureAbly } from '@ably-labs/react-hooks'
import { ABLY_CHANNEL, ABLY_EVENTS, HOST_STORAGE_KEY } from '@/utility/constants'
import * as Ably from 'ably'
import Head from 'next/head'
import store from 'store2'
import HideIcon from '@mui/icons-material/VisibilityOff'
import ShowIcon from '@mui/icons-material/Visibility'

import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Divider,
  RadioGroup,
  Radio,
  Paper,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Collapse,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import { Answer, Question } from '@/types/types'
import { debounce } from '@/utility/functions'

enum MODE {
  DEFAULT = 'default',
  SEARCH = 'search',
  ENTER = 'enter',
  ROUND = 'round',
}

const hostCache = store.namespace(HOST_STORAGE_KEY)
const BASE_QUESTION: Question = {
  text: '',
  answers: [],
}

export default function Host() {
  const [activeQuestionIndex, setActiveQuestionIndex] = React.useState<number | null>(null)
  const [channel, setChannel] = React.useState<Ably.Types.RealtimeChannelPromise | null>(null)
  const [customAnswersErrors, setCustomAnswersErrors] = React.useState<(string | undefined)[]>([])
  const [customQuestion, setCustomQuestion] = React.useState(BASE_QUESTION)
  const [fetchedQuestions, setFetchedQuestions] = React.useState<Question[]>([])
  const [fetching, setFetching] = React.useState(false)
  const [hasCachedQuestion, setHasCachedQuestion] = React.useState(false)
  const [mode, setMode] = React.useState<MODE>(MODE.DEFAULT)
  const [question, setQuestion] = React.useState<Question | null>(null)
  const [showAnswerLookup, setShowAnswerLookup] = React.useState<boolean[]>([])
  const [showAnswers, setShowAnswers] = React.useState(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceValidation = React.useMemo(() => debounce(validatePoints, 250), [])
  function handleStartRound() {
    let newQuestion: Question | undefined

    switch (mode) {
      case MODE.SEARCH:
        if (fetchedQuestions.length && activeQuestionIndex !== null) {
          newQuestion = { ...fetchedQuestions[activeQuestionIndex] }

          setActiveQuestionIndex(null)
          setFetchedQuestions([])
        }
        break
      case MODE.ENTER:
        newQuestion = { ...customQuestion }

        setCustomQuestion(BASE_QUESTION)
        setCustomAnswersErrors([])
        break
    }

    if (newQuestion) {
      setQuestion(newQuestion)
      hostCache.set('question', newQuestion)

      if (channel) {
        channel.publish(ABLY_EVENTS.QUESTION_CHANGE, newQuestion)
      }

      setMode(MODE.ROUND)
    }
  }
  async function handleFetchQuestions() {
    setFetching(true)
    setActiveQuestionIndex(null)

    try {
      const response = await fetch('/api/questions')
      const data: Question[] = await response.json()

      setFetchedQuestions(data)
      setShowAnswerLookup(Array.apply(null, Array(data.length)).map(() => false))
      setFetching(false)
      setMode(MODE.SEARCH)
      hostCache.remove('question')
    } catch (error) {
      console.log(error)
      setFetching(false)
      setFetchedQuestions([])
    }
  }
  function handleActiveQuestionChange(value: number) {
    return () => {
      setActiveQuestionIndex(value)
    }
  }
  function handleResendQuestion() {
    if (channel) channel.publish(ABLY_EVENTS.QUESTION_CHANGE, question)
  }
  function handleReset() {
    setMode(MODE.DEFAULT)
    setFetchedQuestions([])
    setActiveQuestionIndex(null)
    setShowAnswerLookup([])
    setQuestion(null)
    setHasCachedQuestion(false)
    hostCache.remove('question')
  }
  function handleCustomAnswerChange(index: number) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      const answers = [...customQuestion.answers]

      answers[index].text = value

      setCustomQuestion({ ...customQuestion, answers })
    }
  }
  function handleCustomAnswerPointChange(index: number) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      const answers = [...customQuestion.answers]
      const errors = [...customAnswersErrors]
      const points = parseInt(value)

      answers[index].points = isNaN(points) ? (value as unknown as number) : points

      setCustomQuestion({ ...customQuestion, answers })
      debounceValidation(answers)
    }
  }
  function validateCustomQuestion() {
    return (
      !customQuestion.text ||
      !customQuestion.answers.length ||
      customQuestion.answers.some((a) => {
        return !a.text || !a.points
      })
    )
  }
  function validatePoints(answers: Answer[]) {
    const errors = [...customAnswersErrors]
    for (let i = answers.length - 1; i >= 0; i--) {
      const curPoint = answers[i].points
      let curError = undefined

      if (curPoint && isNaN(curPoint)) {
        curError = 'Must be a number'
      } else if (curPoint && !isNaN(curPoint)) {
        const toCheck = answers.slice(0, i)

        const found = toCheck.find((answerToCheck) => {
          const prevPoint = answerToCheck.points

          return prevPoint && !isNaN(prevPoint) && curPoint >= prevPoint
        })

        if (found) curError = 'Number is greater than a previous answer'
      }

      errors[i] = curError
    }

    setCustomAnswersErrors(errors)
  }

  React.useEffect(() => {
    const ably: Ably.Types.RealtimePromise = configureAbly({
      authUrl: '/api/authentication/token-auth',
    })
    const cachedQuestion = hostCache.get('question')
    const _channel = ably.channels.get(ABLY_CHANNEL)

    setChannel(_channel)

    if (cachedQuestion) setHasCachedQuestion(true)

    return () => {
      _channel.unsubscribe()
    }
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>91 Family Feud</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Container
        maxWidth='xl'
        sx={{
          minWidth: 350,
          pt: 2,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant='h1' align='center'>
          Host
        </Typography>
        <Divider />
        {mode === MODE.ROUND && !!question && (
          <React.Fragment>
            <Paper sx={{ mt: 1, p: 2 }}>
              <Stack spacing={2}>
                <Typography variant='h3'>{question.text}</Typography>
                <Collapse in={showAnswers}>
                  <Grid container spacing={1}>
                    {question.answers.map((a, i) => (
                      <Grid key={i} item xs={6}>
                        {a.text}
                      </Grid>
                    ))}
                  </Grid>
                </Collapse>
                <Button variant='outlined' onClick={() => setShowAnswers(!showAnswers)} fullWidth>
                  {showAnswers ? 'Hide' : 'Show'} Answers
                </Button>
              </Stack>
            </Paper>
            <Button sx={{ mt: 2 }} variant='outlined' onClick={handleResendQuestion}>
              Republish Question
            </Button>
            <Button sx={{ mt: 2 }} variant='contained' onClick={handleReset}>
              Pick Another Question
            </Button>
          </React.Fragment>
        )}
        {mode === MODE.DEFAULT && (
          <Box pt={2}>
            <Typography paragraph>
              Please choose an option below on how you would like to choose the next question.
            </Typography>
            {hasCachedQuestion && (
              <Alert severity='warning' sx={{ mb: 2 }}>
                <Typography paragraph>
                  There seems to be a cached question. This may be the result of the browser closing
                  accidently.
                </Typography>
                <Typography>Would you like to load the quesiton from the cache?</Typography>
                <Box display='flex'>
                  <Box flexGrow={1} />
                  <Button
                    onClick={() => {
                      setHasCachedQuestion(false)
                      hostCache.remove('quesiton')
                    }}
                  >
                    No
                  </Button>
                  <Button
                    onClick={() => {
                      setQuestion(hostCache.get('question'))
                      setMode(MODE.ROUND)
                    }}
                  >
                    Yes
                  </Button>
                </Box>
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button variant='outlined' onClick={() => setMode(MODE.ENTER)} fullWidth>
                  Enter Question
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant='outlined' onClick={handleFetchQuestions} fullWidth>
                  Pick Question
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        {mode === MODE.SEARCH && (
          <React.Fragment>
            <List sx={{ flexGrow: 1, pb: 8 }}>
              <RadioGroup name='confirmQuestion'>
                {fetchedQuestions.map((q, i) => (
                  <ListItem
                    divider
                    key={i}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                          event.preventDefault()
                          setShowAnswerLookup((prev) => {
                            const newData = [...prev]
                            newData[i] = !newData[i]

                            return newData
                          })
                        }}
                      >
                        {showAnswerLookup[i] ? <HideIcon /> : <ShowIcon />}
                      </IconButton>
                    }
                  >
                    <ListItemButton onClick={handleActiveQuestionChange(i)}>
                      <ListItemIcon>
                        <Radio
                          checked={i === activeQuestionIndex}
                          edge='start'
                          tabIndex={-1}
                          disableRipple
                          value={i}
                        />
                      </ListItemIcon>
                      <Box>
                        <ListItemText sx={{ flexGrow: 1 }}>{q.text}</ListItemText>
                        {showAnswerLookup[i] && (
                          <Grid container>
                            {q.answers.map((a, i) => (
                              <Grid item key={i} xs={6}>
                                - {a.text}
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </RadioGroup>
            </List>
            <Paper
              square
              elevation={3}
              sx={{
                position: 'fixed',
                bottom: -1,
                left: 0,
                right: 0,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                height: 65,
              }}
            >
              <Button variant='outlined' onClick={handleFetchQuestions}>
                Refresh
              </Button>
              <Box flexGrow={1} />
              <Button sx={{ mr: 1 }} onClick={handleReset}>
                Cancel
              </Button>
              <Button
                variant='contained'
                disabled={activeQuestionIndex === null}
                onClick={handleStartRound}
              >
                Set Question
              </Button>
            </Paper>
          </React.Fragment>
        )}
        {mode === MODE.ENTER && (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12}>
              <Typography>Enter custom question below.</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                maxRows={2}
                multiline
                label='Question'
                placeholder='Enter Custom Qustion Here'
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const { value } = event.target

                  setCustomQuestion({ ...customQuestion, text: value })
                }}
                value={customQuestion.text}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id='answer-total-label'>Total Answers</InputLabel>
                <Select
                  labelId='answer-total-label'
                  id='answer-total'
                  value={customQuestion.answers.length ? customQuestion.answers.length : ''}
                  label='Total Answers'
                  onChange={(event: SelectChangeEvent<number>) => {
                    let { value } = event.target
                    if (typeof value === 'string') value = parseInt(value)

                    const blankErrors: undefined[] = Array.from({ length: value }, () => undefined)
                    const blankAnswers: Answer[] = Array.from({ length: value }, () => ({
                      text: '',
                      points: 0,
                      isAnswered: false,
                    }))

                    const answers = [...customQuestion.answers, ...blankAnswers].slice(0, value)
                    const errors = [...customAnswersErrors, ...blankErrors].slice(0, value)

                    setCustomQuestion({ ...customQuestion, answers })
                    setCustomAnswersErrors(errors)
                  }}
                >
                  <MenuItem value={3}>Three</MenuItem>
                  <MenuItem value={4}>Four</MenuItem>
                  <MenuItem value={5}>Five</MenuItem>
                  <MenuItem value={6}>Six</MenuItem>
                  <MenuItem value={7}>Seven</MenuItem>
                  <MenuItem value={8}>Eight</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {customQuestion.answers.map((a, i) => (
              <Grid key={i} container spacing={2} sx={{ marginLeft: 0, marginTop: 0 }}>
                <Grid item xs={8}>
                  <TextField
                    label={`Answer ${i + 1}`}
                    value={a.text}
                    onChange={handleCustomAnswerChange(i)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label={`Answer ${i + 1} Points`}
                    value={a.points ? a.points : ''}
                    error={!!customAnswersErrors[i]}
                    helperText={customAnswersErrors[i] ? customAnswersErrors[i] : undefined}
                    onChange={handleCustomAnswerPointChange(i)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            ))}
            <Grid item xs={6}>
              <Button
                variant='outlined'
                onClick={() => {
                  setCustomQuestion(BASE_QUESTION)
                  setCustomAnswersErrors([])
                  setMode(MODE.DEFAULT)
                }}
                fullWidth
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant='contained'
                disabled={validateCustomQuestion()}
                onClick={handleStartRound}
                fullWidth
              >
                Submit Question
              </Button>
            </Grid>
          </Grid>
        )}
      </Container>
    </React.Fragment>
  )
}
