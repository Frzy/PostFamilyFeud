import * as React from 'react'

import { Box, Paper, Stack, Button, Typography } from '@mui/material'

import type { Game, TeamName } from '@/types/types'
import { ROUND_MODE } from '@/utility/constants'

interface GameRoundProps {
  game: Game
  disabled?: boolean
  roundMode?: ROUND_MODE
  winner?: TeamName
  onWinner?: (team: TeamName) => void
  onUndoWinner?: (team: TeamName) => void
  onRoundChange?: () => void
}

export default function GameRounds({
  game,
  disabled,
  roundMode,
  winner,
  onWinner,
  onUndoWinner,
  onRoundChange,
}: GameRoundProps) {
  const roundText = React.useMemo(() => {
    switch (roundMode) {
      case ROUND_MODE.DOUBLE:
        return 'Round (Double Points)'
      case ROUND_MODE.TRIPLE:
        return 'Round (Triple Points)'
      default:
        return 'Round'
    }
  }, [roundMode])

  function handleUndo(team: TeamName) {
    return () => {
      if (onUndoWinner) onUndoWinner(team)
    }
  }
  function handleWinner(team: TeamName) {
    return () => {
      if (onWinner) onWinner(team)
    }
  }
  function handleRoundChange() {
    if (onRoundChange) onRoundChange()
  }

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={0.5}>
        <Paper
          variant='outlined'
          sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between' }}
        >
          <Typography color={disabled ? 'text.disabled' : undefined}>{roundText}</Typography>
          <Typography color={disabled ? 'text.disabled' : undefined}>
            {game.roundsPlayed + 1} of {game.totalRounds}
          </Typography>
        </Paper>
        <Box
          sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Button
            onClick={winner === 'teamOne' ? handleUndo('teamOne') : handleWinner('teamOne')}
            disabled={disabled || winner === 'teamTwo'}
            size='small'
          >
            {winner === 'teamOne' ? 'Undo' : 'Won'}
          </Button>
          <Paper
            variant='outlined'
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            <Typography color={disabled ? 'text.disabled' : undefined}>
              {game.teamOne.name}
            </Typography>
            <Typography color={disabled ? 'text.disabled' : undefined}>
              {game.teamOne.points}
            </Typography>
          </Paper>
        </Box>
        <Box
          sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Button
            onClick={winner === 'teamTwo' ? handleUndo('teamTwo') : handleWinner('teamTwo')}
            disabled={disabled || winner === 'teamOne'}
            size='small'
          >
            {winner === 'teamTwo' ? 'Undo' : 'Won'}
          </Button>
          <Paper
            variant='outlined'
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            <Typography color={disabled ? 'text.disabled' : undefined}>
              {game.teamTwo.name}
            </Typography>
            <Typography color={disabled ? 'text.disabled' : undefined}>
              {game.teamTwo.points}
            </Typography>
          </Paper>
        </Box>
        <Button
          disabled={disabled || winner === undefined}
          variant='outlined'
          onClick={handleRoundChange}
        >
          {game.roundsPlayed + 1 >= game.totalRounds ? 'End Game' : 'Next Round'}
        </Button>
      </Stack>
    </Paper>
  )
}
