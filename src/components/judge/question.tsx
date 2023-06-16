import * as React from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper, { PaperProps } from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface JudgeQuestionProps extends PaperProps {
  question: string
  disabled?: boolean
  onVisibilityChange?: (isVisible: boolean) => void
}

export default function Question({ question, disabled, onVisibilityChange }: JudgeQuestionProps) {
  function handleBoardQuestionVisibility(visible: boolean) {
    return () => {
      if (onVisibilityChange) onVisibilityChange(visible)
    }
  }

  return (
    <Paper>
      <Stack spacing={0.5}>
        <Typography variant='subtitle2' sx={{ fontSize: '1.25rem' }} align='center'>
          Question
        </Typography>
        <Divider />
        <Box sx={{ py: 1, px: 2 }}>
          <Typography>{question}</Typography>
        </Box>
        <Divider />
        <Box display='flex' justifyContent='space-evenly' sx={{ px: 1 }}>
          <Button onClick={handleBoardQuestionVisibility(false)} disabled={disabled}>
            Show Strikes
          </Button>
          <Button onClick={handleBoardQuestionVisibility(true)} disabled={disabled}>
            Show Question
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}
