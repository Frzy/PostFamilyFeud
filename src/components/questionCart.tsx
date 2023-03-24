import * as React from 'react'
import * as Ably from 'ably'
import { ABLY_EVENTS, ROUND_MODE } from '@/utility/constants'

enum QUESTION_TYPE {
  NORMAL = 'Publish',
  DOUBLE = 'Publish x2',
  TRIPLE = 'Publish x3',
}

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import type { ListQuestion } from '@/types/types'
import SplitButton from './splitButton'

interface QuestionCartProps {
  questions?: ListQuestion[]
  channel: Ably.Types.RealtimeChannelPromise
  onPublish?: (index: number) => void
  onRePublish?: (question: ListQuestion) => void
  onRemove?: (index: number) => void
}
export default function QuestionCart({
  questions = [],
  channel,
  onPublish,
  onRePublish,
  onRemove,
}: QuestionCartProps) {
  const [roundMode, setRoundMode] = React.useState<ROUND_MODE>()
  const activeQuestion = React.useMemo(() => {
    return questions.find((q) => q.active)
  }, [questions])

  const handleNewRoundChange = React.useCallback(() => {
    const activeIndex = questions.findIndex((q) => q.active)
    if (activeIndex !== -1 && onRemove) onRemove(activeIndex)
  }, [questions, onRemove])

  function handlePublishQuestion(index: number) {
    return (questionType: QUESTION_TYPE) => {
      if (onPublish) {
        onPublish(index)
      }

      if (channel) {
        const q = questions[index]
        if (questionType === QUESTION_TYPE.DOUBLE) {
          q.roundMode = ROUND_MODE.DOUBLE
          setRoundMode(ROUND_MODE.DOUBLE)
        } else if (questionType === QUESTION_TYPE.TRIPLE) {
          q.roundMode = ROUND_MODE.TRIPLE
          setRoundMode(ROUND_MODE.TRIPLE)
        } else {
          q.roundMode = ROUND_MODE.NORMAL
          setRoundMode(ROUND_MODE.NORMAL)
        }

        channel.publish(ABLY_EVENTS.PUBLISH_QUESITON, q)
      }
    }
  }
  function handleRemoveQuestion(index: number) {
    return () => {
      if (onRemove) onRemove(index)
    }
  }

  function handleRepublish(questionType: QUESTION_TYPE) {
    return () => {
      if (!activeQuestion) return

      if (questionType === QUESTION_TYPE.DOUBLE) {
        activeQuestion.roundMode = ROUND_MODE.DOUBLE
        setRoundMode(ROUND_MODE.DOUBLE)
      } else if (questionType === QUESTION_TYPE.TRIPLE) {
        activeQuestion.roundMode = ROUND_MODE.TRIPLE
        setRoundMode(ROUND_MODE.TRIPLE)
      } else {
        activeQuestion.roundMode = ROUND_MODE.NORMAL
        setRoundMode(ROUND_MODE.NORMAL)
      }

      if (onRePublish) onRePublish(activeQuestion)
      if (channel) channel.publish(ABLY_EVENTS.PUBLISH_QUESITON, activeQuestion)
    }
  }

  React.useEffect(() => {
    if (channel) channel.subscribe(ABLY_EVENTS.NEW_ROUND, handleNewRoundChange)

    return () => {
      if (channel) channel.unsubscribe(ABLY_EVENTS.NEW_ROUND, handleNewRoundChange)
    }
  }, [channel, handleNewRoundChange])

  return (
    <Stack spacing={1}>
      {activeQuestion && (
        <Card>
          <CardContent sx={{ pb: 1 }}>
            <Typography color='text.secondary' variant='h3' align='center' gutterBottom>
              Active Question
            </Typography>
            <Paper variant='outlined' sx={{ p: 1 }}>
              <Typography>{activeQuestion.text}</Typography>
            </Paper>
            <Typography color='text.secondary' variant='body2'>
              Answers
            </Typography>
            <Paper variant='outlined' sx={{ p: 1 }}>
              <Grid container>
                {activeQuestion.answers.map((a, i) => (
                  <Grid item key={i} xs={6} md={4} lg={2}>
                    {a.text}
                  </Grid>
                ))}
              </Grid>
            </Paper>
            <Typography color='text.secondary' variant='body2'>
              Round Mode
            </Typography>
            <Paper variant='outlined' sx={{ p: 1 }}>
              <Grid container>{roundMode?.toUpperCase()}</Grid>
            </Paper>
          </CardContent>
          <Divider />
          <CardActions>
            <Button onClick={handleRepublish(QUESTION_TYPE.NORMAL)} fullWidth variant='outlined'>
              RePublish Normal
            </Button>
            <Button onClick={handleRepublish(QUESTION_TYPE.DOUBLE)} fullWidth variant='outlined'>
              RePublish Double
            </Button>
            <Button onClick={handleRepublish(QUESTION_TYPE.TRIPLE)} fullWidth variant='outlined'>
              RePublish Triple
            </Button>
          </CardActions>
        </Card>
      )}
      <Divider />
      {questions.map((q, i) => {
        return q.active ? null : (
          <Card key={i}>
            <CardContent sx={{ pb: 1 }}>
              <Typography color='text.secondary' variant='body2'>
                Question
              </Typography>
              <Paper variant='outlined' sx={{ p: 1 }}>
                <Typography>{q.text}</Typography>
              </Paper>
              <Typography color='text.secondary' variant='body2'>
                Answers
              </Typography>
              <Paper variant='outlined' sx={{ p: 1 }}>
                <Grid container>
                  {q.answers.map((a, i) => (
                    <Grid item key={i} xs={6} md={4} lg={2}>
                      {a.text}
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </CardContent>
            <Divider />
            <CardActions>
              <Button onClick={handleRemoveQuestion(i)} color='error'>
                Remove
              </Button>
              {/* <Button onClick={handlePublishQuestion(i)}>Publish</Button> */}
              <SplitButton
                onClick={handlePublishQuestion(i)}
                options={[QUESTION_TYPE.NORMAL, QUESTION_TYPE.DOUBLE, QUESTION_TYPE.TRIPLE]}
              />
            </CardActions>
          </Card>
        )
      })}
    </Stack>
  )
}
