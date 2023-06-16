import * as React from 'react'

import type { Answer } from '@/types/types'
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { ROUND_MODE } from '@/utility/constants'
import { getAnsweredPoints } from '@/utility/functions'

interface AnswerListProps {
  answers?: Answer[]
  disabled?: boolean
  reveal?: boolean
  roundMode?: ROUND_MODE
  onChange?: (answers: Answer[]) => void
  onRevealChange?: (reveal: boolean) => void
}

export default function Answers({
  answers = [],
  disabled,
  onChange,
  onRevealChange,
  reveal = false,
  roundMode = ROUND_MODE.NORMAL,
}: AnswerListProps) {
  const points = React.useMemo(() => {
    return getAnsweredPoints(answers, roundMode)
  }, [answers, roundMode])
  function toggleAnswer(answerIndex: number) {
    return () => {
      const newAnswers = [...answers]
      const answer = {...newAnswers[answerIndex]}
      const answerToggled = !answer.showAnswer

      answer.showAnswer = answerToggled
      answer.isAnswered = reveal ? false : answerToggled

      newAnswers.splice(answerIndex, 1, answer)

      if (onChange) onChange(newAnswers)
    }
  }

  function handleRevealChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target

    if (onRevealChange) onRevealChange(checked)
  }

  function isAnswerDisabled(answer: Answer) {
    return disabled || (reveal && answer.isAnswered)
  }

  return (
    <Paper>
      <Stack spacing={0.5}>
        <Typography variant='subtitle2' sx={{ fontSize: '1.25rem' }} align='center'>
          Answers
        </Typography>
        <List disablePadding dense>
          <Divider sx={{ mt: '1px' }} />
          {answers.map((a, i) => (
            <ListItem key={i} divider disablePadding>
              <ListItemButton disabled={isAnswerDisabled(a)} onClick={toggleAnswer(i)}>
                <ListItemIcon>
                  <Checkbox checked={a.showAnswer} edge='start' tabIndex={-1} disableRipple />
                </ListItemIcon>
                <ListItemText sx={{ flexGrow: 1 }}>{a.text}</ListItemText>
                <ListItemText sx={{ flex: '0 0 auto' }}>{a.points}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box p={1} display='flex' justifyContent='space-between' alignItems='center'>
          <FormControlLabel
            sx={{ pl: 1.5 }}
            control={<Switch checked={reveal} onChange={handleRevealChange} size='small' />}
            label={<Typography variant='body2'>Reveal Only</Typography>}
          />
          <Box display='flex' gap={1} alignItems='center'>
            <Typography variant='body2' color='textSecondary'>
              Total
            </Typography>
            <Paper variant='outlined' sx={{ px: 1, minWidth: 45, textAlign: 'right' }}>
              {points}
            </Paper>
          </Box>
        </Box>
      </Stack>
    </Paper>
  )
}
