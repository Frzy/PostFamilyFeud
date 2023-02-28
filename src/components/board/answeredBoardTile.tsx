import * as React from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface AnsweredBoardTileProps {
  text: string
  points: number
}
export default function AnsweredBoardTile({ text, points }: AnsweredBoardTileProps) {
  return (
    <Box display='flex' flexGrow={1} height='100%' width='100%' alignItems='center'>
      <Typography
        variant='h2'
        sx={{
          px: 1,
          fontWeight: 'fontWeightBold',
          flexGrow: 1,
          fontSize: {
            xs: 32,
            sm: 24,
            md: 40,
            lg: 48,
          },
          textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000',
        }}
      >
        {text.toUpperCase()}
      </Typography>
      <Box
        sx={{
          borderLeft: '4px groove #FFF',
          backgroundColor: '#376cbe',
          height: '100%',
          minWidth: {
            xs: 80,
            md: 100,
            lg: 125,
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          fontWeight='fontWeightBold'
          sx={{
            fontSize: {
              xs: 40,
              md: 64,
              lg: 80,
            },
            textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000',
          }}
        >
          {points}
        </Typography>
      </Box>
    </Box>
  )
}
