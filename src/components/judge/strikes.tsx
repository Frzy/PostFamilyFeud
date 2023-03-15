import * as React from 'react'

import { Box, Button, FormControlLabel, Stack, Switch, Paper, Typography } from '@mui/material'
import { red, grey } from '@mui/material/colors'
import CloseIcon from '@mui/icons-material/Close'

interface StrikeProps {
  strikes?: number
  disabled?: boolean
  onChange?: (strikes: number, animate: boolean) => void
}

export default function Strikes({ strikes = 0, disabled, onChange }: StrikeProps) {
  const [showStrikeAnimation, setShowStrikeAnimation] = React.useState(true)
  const notActiveColor = grey[800]
  const activeColor = red[500]

  function hanldeAnimationChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target

    setShowStrikeAnimation(checked)
  }
  function handleChange(substract: boolean) {
    return () => {
      if (onChange)
        onChange(
          substract ? Math.max(strikes - 1, 0) : Math.min(4, strikes + 1),
          substract ? false : showStrikeAnimation,
        )
    }
  }

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={1}>
        <Paper variant='outlined' sx={{ p: 1 }}>
          <Box display='flex'>
            <Typography color={disabled ? 'text.disabled' : undefined} sx={{ flexGrow: 1 }}>
              Strikes
            </Typography>
            <Box display='flex' gap={1} height={25}>
              <CloseIcon
                sx={{
                  color: strikes > 0 ? activeColor : notActiveColor,
                  border: `1px solid ${strikes > 0 ? activeColor : notActiveColor}`,
                  borderRadius: 1,
                  fontSize: 25,
                }}
              />
              <CloseIcon
                sx={{
                  color: strikes > 1 ? activeColor : notActiveColor,
                  border: `1px solid ${strikes > 1 ? activeColor : notActiveColor}`,
                  borderRadius: 1,
                  fontSize: 25,
                }}
              />
              <CloseIcon
                sx={{
                  color: strikes > 2 ? activeColor : notActiveColor,
                  border: `1px solid ${strikes > 2 ? activeColor : notActiveColor}`,
                  borderRadius: 1,
                  fontSize: 25,
                }}
              />
            </Box>
          </Box>
        </Paper>
        <Paper variant='outlined' sx={{ p: 1 }}>
          <Box display='flex'>
            <Typography sx={{ flexGrow: 1 }} color={disabled ? 'text.disabled' : undefined}>
              Steal
            </Typography>
            <Box display='flex' gap={1} height={25}>
              <CloseIcon
                sx={{
                  color: strikes > 3 ? activeColor : notActiveColor,
                  border: `1px solid ${strikes > 3 ? activeColor : notActiveColor}`,
                  borderRadius: 1,
                  fontSize: 25,
                }}
              />
            </Box>
          </Box>
        </Paper>
        <Box display='flex' justifyContent='space-between'>
          <Button size='small' onClick={handleChange(true)} disabled={disabled || strikes <= 0}>
            Remove
          </Button>
          <Button size='small' onClick={handleChange(false)} disabled={disabled || strikes >= 4}>
            Add
          </Button>
        </Box>
        <Box pl={1.5}>
          <FormControlLabel
            control={
              <Switch
                checked={showStrikeAnimation}
                onChange={hanldeAnimationChange}
                disabled={disabled}
                size='small'
              />
            }
            label={
              <Typography color={disabled ? 'text.disabled' : undefined} variant='body2'>
                Show Animation on Game Board
              </Typography>
            }
          />
        </Box>
      </Stack>
    </Paper>
  )
}
