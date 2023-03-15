import * as React from 'react'
import * as Ably from 'ably'
import { configureAbly } from '@ably-labs/react-hooks'
import { ABLY_CHANNEL, ABLY_EVENTS } from '@/utility/constants'

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
interface QuestionCartProps {
  questions?: ListQuestion[]
  onPublish?: (index: number) => void
  onRePublish?: (question: ListQuestion) => void
  onRemove?: (index: number) => void
}
export default function QuestionCart({
  questions = [],
  onPublish,
  onRePublish,
  onRemove,
}: QuestionCartProps) {
  const [channel, setChannel] = React.useState<Ably.Types.RealtimeChannelPromise | null>()
  const activeQuestion = React.useMemo(() => {
    return questions.find((q) => q.active)
  }, [questions])

  function handlePublishQuestion(index: number) {
    return () => {
      if (onPublish) {
        onPublish(index)
      }

      if (channel) {
        const q = questions[index]
        channel.publish(ABLY_EVENTS.PUBLISH_QUESITON, q)
      }
    }
  }
  function handleRemoveQuestion(index: number) {
    return () => {
      if (onRemove) onRemove(index)
    }
  }
  function handleRepublish() {
    if (!activeQuestion) return
    if (onRePublish) onRePublish(activeQuestion)
    if (channel) channel.publish(ABLY_EVENTS.PUBLISH_QUESITON, activeQuestion)
  }
  function handleNewRoundChange() {
    const activeIndex = questions.findIndex((q) => q.active)

    if (activeIndex !== -1) handleRemoveQuestion(activeIndex)()
  }

  React.useEffect(() => {
    const ably: Ably.Types.RealtimePromise = configureAbly({
      authUrl: '/api/authentication/token-auth',
    })
    const _channel = ably.channels.get(ABLY_CHANNEL)

    _channel.subscribe(ABLY_EVENTS.NEW_ROUND, handleNewRoundChange)
    setChannel(_channel)

    return () => {
      _channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          </CardContent>
          <Divider />
          <CardActions>
            <Button onClick={handleRepublish} fullWidth variant='outlined'>
              Re-Publish
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
              <Button onClick={handlePublishQuestion(i)}>Publish</Button>
            </CardActions>
          </Card>
        )
      })}
    </Stack>
  )
}
