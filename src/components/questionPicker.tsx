import * as React from 'react'
import { Box, Button, Typography, Stack, ToggleButton, Divider } from '@mui/material'
import ManualQuestionEntry from './manualQuestionEntry'
import OnlineQuesitonPicker, { OnlineQuestionPickerHandle } from './onlineQuestionPicker'

import type { Question, RoundQuestion } from '@/types/types'
import { ROUND_MODE } from '@/utility/constants'

enum MODE {
  MANUAL = 'manual',
  SEARCH = 'search',
}

interface QuestionPicker {
  onQuestionSelect?: (question: RoundQuestion) => void
}
export default function QuestionPicker({ onQuestionSelect }: QuestionPicker) {
  const [mode, setMode] = React.useState<MODE>(MODE.SEARCH)
  const [roundMode, setRoundMode] = React.useState<ROUND_MODE>(ROUND_MODE.NORMAL)
  const onlineRef = React.useRef<OnlineQuestionPickerHandle>(null)

  function handelModeChange(newMode: MODE) {
    return () => setMode(newMode)
  }
  function handleQuestionSelect(question: Question) {
    if (onQuestionSelect) onQuestionSelect({ ...question, roundMode })
  }

  return (
    <React.Fragment>
      <Typography sx={{ pt: 1 }} gutterBottom>
        Please select below the question and the point value type of round that is about to be
        played.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
        }}
      >
        <ToggleButton
          value={ROUND_MODE.NORMAL}
          selected={roundMode === ROUND_MODE.NORMAL}
          fullWidth
          onChange={() =>
            setRoundMode((prev) =>
              prev === ROUND_MODE.NORMAL ? ROUND_MODE.NONE : ROUND_MODE.NORMAL,
            )
          }
        >
          {ROUND_MODE.NORMAL}
        </ToggleButton>
        <ToggleButton
          value={ROUND_MODE.DOUBLE}
          selected={roundMode === ROUND_MODE.DOUBLE}
          fullWidth
          onChange={() =>
            setRoundMode((prev) =>
              prev === ROUND_MODE.DOUBLE ? ROUND_MODE.NONE : ROUND_MODE.DOUBLE,
            )
          }
        >
          {ROUND_MODE.DOUBLE}
        </ToggleButton>
        <ToggleButton
          value={ROUND_MODE.TRIPLE}
          selected={roundMode === ROUND_MODE.TRIPLE}
          fullWidth
          onChange={() =>
            setRoundMode((prev) =>
              prev === ROUND_MODE.TRIPLE ? ROUND_MODE.NONE : ROUND_MODE.TRIPLE,
            )
          }
        >
          {ROUND_MODE.TRIPLE}
        </ToggleButton>
      </Box>
      <Divider sx={{ mt: 1 }} />
      {mode === MODE.SEARCH && (
        <OnlineQuesitonPicker
          ref={onlineRef}
          onQuestionSelect={handleQuestionSelect}
          emptyListComponent={
            <Box
              display='flex'
              sx={{
                pt: { sx: 0, md: 3 },
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: { xs: 'center' },
              }}
              height='100%'
              flexDirection='column'
            >
              <Typography gutterBottom align='center'>
                No question were found using the online fetcher. You may enter a question manually
                or try again to populate the list.
              </Typography>
              <Stack sx={{ mt: 2 }} spacing={1}>
                <Button variant='outlined' fullWidth onClick={handelModeChange(MODE.MANUAL)}>
                  Manually Enter a Question
                </Button>
                <Button
                  variant='outlined'
                  onClick={() => {
                    if (onlineRef.current) onlineRef.current.refresh()
                  }}
                  fullWidth
                >
                  Refresh the List
                </Button>
              </Stack>
            </Box>
          }
          onExit={() => setMode(MODE.MANUAL)}
          autoFetch
        />
      )}
      {mode === MODE.MANUAL && (
        <ManualQuestionEntry
          onExit={() => setMode(MODE.SEARCH)}
          onQuestionSubmit={handleQuestionSelect}
        />
      )}
    </React.Fragment>
  )
}
