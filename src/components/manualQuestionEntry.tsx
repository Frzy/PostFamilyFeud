import * as React from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  Paper,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Answer, Question } from '@/types/types'
import { debounce } from '@/utility/functions'

const BASE_QUESTION: Question = {
  text: '',
  tags: [],
  answers: [],
}

interface ManualQuestionEntryProps {
  onExit?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onQuestionSubmit?: (question: Question) => void
}

export default function ManualQuestionEntry({
  onExit,
  onQuestionSubmit,
}: ManualQuestionEntryProps) {
  const [question, setQuestion] = React.useState(BASE_QUESTION)
  const [answerErrors, setAnswerErrors] = React.useState<(string | undefined)[]>([])
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceValidation = React.useMemo(() => debounce(validatePoints, 250), [])

  function handleCustomAnswerChange(index: number) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      const answers = [...question.answers]

      answers[index].text = value

      setQuestion({ ...question, answers })
    }
  }
  function handleCustomAnswerPointChange(index: number) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      const answers = [...question.answers]
      const points = parseInt(value)

      answers[index].points = isNaN(points) ? (value as unknown as number) : points

      setQuestion({ ...question, answers })
      debounceValidation(answers)
    }
  }
  function validatePoints(answers: Answer[]) {
    const errors = [...answerErrors]
    for (let i = answers.length - 1; i >= 0; i--) {
      const curPoint = answers[i].points
      let curError = undefined

      if (curPoint && isNaN(curPoint)) {
        curError = 'Must be a number'
      } else if (curPoint && !isNaN(curPoint)) {
        const toCheck = answers.slice(0, i)

        const found = toCheck.find((answerToCheck) => {
          const prevPoint = answerToCheck.points

          return prevPoint && !isNaN(prevPoint) && curPoint > prevPoint
        })

        if (found) curError = 'Number is greater than a previous answer'
      }

      errors[i] = curError
    }

    setAnswerErrors(errors)
  }
  function validateQuestion() {
    return (
      !question.text ||
      !question.answers.length ||
      question.answers.some((a) => {
        return !a.text || !a.points
      })
    )
  }
  function handleQuestionSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    if (onQuestionSubmit) onQuestionSubmit(question)
  }

  return (
    <Box sx={{ flexGrow: 1, mt: 1, mb: 8, overflow: 'auto' }}>
      <Grid container spacing={2}>
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

              setQuestion({ ...question, text: value })
            }}
            value={question.text}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id='answer-total-label'>Total Answers</InputLabel>
            <Select
              labelId='answer-total-label'
              id='answer-total'
              value={question.answers.length ? question.answers.length : ''}
              label='Total Answers'
              onChange={(event: SelectChangeEvent<number>) => {
                let { value } = event.target
                if (typeof value === 'string') value = parseInt(value)

                const blankErrors: undefined[] = Array.from({ length: value }, () => undefined)
                const blankAnswers: Answer[] = Array.from({ length: value }, () => ({
                  text: '',
                  points: 0,
                  isAnswered: false,
                  showAnswer: false,
                }))

                const answers = [...question.answers, ...blankAnswers].slice(0, value)
                const errors = [...answerErrors, ...blankErrors].slice(0, value)

                setQuestion({ ...question, answers })
                setAnswerErrors(errors)
              }}
            >
              <MenuItem value={1}>One</MenuItem>
              <MenuItem value={2}>Two</MenuItem>
              <MenuItem value={3}>Three</MenuItem>
              <MenuItem value={4}>Four</MenuItem>
              <MenuItem value={5}>Five</MenuItem>
              <MenuItem value={6}>Six</MenuItem>
              <MenuItem value={7}>Seven</MenuItem>
              <MenuItem value={8}>Eight</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {question.answers.map((a, i) => (
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
                label='Points'
                value={a.points ? a.points : ''}
                error={!!answerErrors[i]}
                helperText={!isSmall && !!answerErrors[i] ? answerErrors[i] : undefined}
                onChange={handleCustomAnswerPointChange(i)}
                fullWidth
              />
            </Grid>
            {isSmall && answerErrors[i] && (
              <Box display='flex' justifyContent='flex-end' width='100%' mt={0.5} pr={1}>
                <Typography variant='caption' color='error'>
                  {answerErrors[i]}
                </Typography>
              </Box>
            )}
          </Grid>
        ))}
      </Grid>
      <Container
        maxWidth='xl'
        disableGutters
        sx={{
          position: 'fixed',
          bottom: -1,
          left: 0,
          right: 0,
          height: 57,
        }}
      >
        <Paper
          square
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            px: 3,
          }}
          elevation={3}
        >
          {onExit ? (
            <Button size='large' onClick={onExit}>
              Search
            </Button>
          ) : (
            <div />
          )}

          <Button size='large' disabled={validateQuestion()} onClick={handleQuestionSubmit}>
            Submit
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}
