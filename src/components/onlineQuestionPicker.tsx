import * as React from 'react'

import {
  Badge,
  Box,
  Button,
  Container,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
} from '@mui/material'
import HideIcon from '@mui/icons-material/VisibilityOff'
import ShowIcon from '@mui/icons-material/Visibility'

import type { Question } from '@/types/types'

type ListQuestion = { showAnswers: boolean } & Question
export type OnlineQuestionPickerHandle = {
  refresh: () => void
}
interface OnlineQuesitonPickerProps {
  onQuestionSelect?: (question: Question) => void
  onExit?: () => void
  autoFetch?: boolean
  emptyListComponent?: React.ReactNode
}

export default React.forwardRef<OnlineQuestionPickerHandle, OnlineQuesitonPickerProps>(
  function OnlineQuesitonPicker({ autoFetch, onQuestionSelect, emptyListComponent, onExit }, ref) {
    const [fetching, setFetching] = React.useState(false)
    const [questionIndex, setQuestionIndex] = React.useState<number>()
    const [questions, setQuestions] = React.useState<ListQuestion[]>([])

    async function handleFetchQuestions() {
      setFetching(true)
      setQuestionIndex(undefined)

      try {
        const response = await fetch('/api/questions')
        const data: Question[] = await response.json()

        setQuestions(data.map((q) => ({ ...q, showAnswers: false })))
        setFetching(false)
      } catch (error) {
        setFetching(false)
        setQuestions([])
      }
    }
    function handleQuestionIndexChange(value: number) {
      return () => {
        setQuestionIndex((prev) => (prev === value ? undefined : value))
      }
    }
    function handleShowAnswers(index: number) {
      return () => {
        const q = [...questions]
        q[index].showAnswers = !q[index].showAnswers

        setQuestions(q)
      }
    }
    function handleQuestionSelect() {
      if (questionIndex === undefined) return

      const { text, answers } = questions[questionIndex]

      if (onQuestionSelect) onQuestionSelect({ text, answers })
    }

    React.useImperativeHandle(ref, () => ({
      refresh: handleFetchQuestions,
    }))
    React.useEffect(() => {
      if (autoFetch) handleFetchQuestions()
    }, [autoFetch])

    return (
      <React.Fragment>
        {fetching && (
          <Box display='flex' justifyContent='center' alignItems='center' flexGrow={1}>
            <CircularProgress size={75} />
          </Box>
        )}
        {!fetching && !!questions.length && (
          <List sx={{ flexGrow: 1, mb: 8, overflow: 'auto' }} disablePadding>
            {questions.map((q, i) => (
              <ListItem
                divider
                key={i}
                disablePadding
                secondaryAction={
                  <IconButton onClick={handleShowAnswers(i)}>
                    <Badge
                      badgeContent={q.showAnswers ? 0 : q.answers.length}
                      color='secondary'
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      {q.showAnswers ? <HideIcon /> : <ShowIcon />}
                    </Badge>
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={questionIndex === i}
                  disableGutters
                  onClick={handleQuestionIndexChange(i)}
                >
                  <ListItemIcon sx={{ ml: 1, minWidth: 42 }}>
                    <Radio
                      checked={i === questionIndex}
                      edge='start'
                      tabIndex={-1}
                      disableRipple
                      value={i}
                    />
                  </ListItemIcon>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <ListItemText sx={{ flexGrow: 1 }}>{q.text}</ListItemText>
                    {q.showAnswers && (
                      <React.Fragment>
                        <Divider sx={{ my: 1 }} />
                        <Grid container>
                          {q.answers.map((a, i) => (
                            <Grid item key={i} xs={12} sm={6} md={4} lg={2}>
                              {i + 1}. {a.text} - {a.points} points
                            </Grid>
                          ))}
                        </Grid>
                      </React.Fragment>
                    )}
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        {!fetching && !questions.length && !!emptyListComponent && emptyListComponent}
        {!fetching && !!questions.length && (
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
              {onExit && <Button onClick={onExit}>Manual</Button>}
              <Button size='large' onClick={handleFetchQuestions}>
                Refresh
              </Button>
              <Button
                size='large'
                onClick={handleQuestionSelect}
                disabled={questionIndex === undefined}
              >
                Select
              </Button>
            </Paper>
          </Container>
        )}
      </React.Fragment>
    )
  },
)
