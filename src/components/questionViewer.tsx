import * as React from 'react'
import type { RoundQuestion } from '@/types/types'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type FontSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

interface QuestionViewerProps {
  question: RoundQuestion
}

const FONT_SIZES: FontSize[] = ['h1', 'h2', 'h3', 'h4', 'h5']

export default function QuestionViewer({ question }: QuestionViewerProps) {
  const [fontSizeIndex, setFontSizeIndex] = React.useState(1)
  const [showAnswers, setShowAnswers] = React.useState(false)

  function handleIncreaseFontSize() {
    setFontSizeIndex((prev) => Math.max(0, prev - 1))
  }
  function handleDecreaseFontSize() {
    setFontSizeIndex((prev) => Math.min(prev + 1, FONT_SIZES.length - 1))
  }

  return (
    <Box>
      <Stack spacing={1}>
        <Paper sx={{ p: 1 }}>
          <Typography variant='h3' align='center'>
            Question
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant={FONT_SIZES[fontSizeIndex]}>{question.text}</Typography>
          <Divider sx={{ my: 1 }} />
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Button
              disabled={fontSizeIndex >= FONT_SIZES.length - 1}
              onClick={handleDecreaseFontSize}
            >
              Smaller
            </Button>
            <Typography>Font Size</Typography>
            <Button disabled={fontSizeIndex <= 0} onClick={handleIncreaseFontSize}>
              Bigger
            </Button>
          </Box>
        </Paper>
        <Paper sx={{ p: 1, pb: 0 }}>
          <Typography variant='h3' align='center'>
            Answers
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Button onClick={() => setShowAnswers(!showAnswers)} fullWidth>
            {showAnswers ? 'Hide' : 'Show'} Answers
          </Button>
          <Collapse sx={{ mt: showAnswers ? 0 : 1 }} in={showAnswers}>
            <Divider sx={{ mt: 1 }} />
            <List disablePadding>
              {question.answers.map((answer, index) => (
                <ListItem divider={index < question.answers.length - 1} key={index}>
                  <ListItemText sx={{ flexGrow: 1 }}>{answer.text}</ListItemText>
                  <Chip label={answer.points} variant='outlined' />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      </Stack>
    </Box>
  )
}
