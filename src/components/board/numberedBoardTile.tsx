import * as React from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface NumberedBoardTileProps {
  position: number
}
export default function NumberedBoardTile({ position }: NumberedBoardTileProps) {
  return (
    <Box display='flex' height='100%' width='100%' alignItems='center' justifyContent='center'>
      <Box
        sx={{
          backgroundColor: '#003171',
          border: '4px solid #FFF',
          position: 'relative',
          borderRadius: 50,
          width: {
            xs: 70,
            md: 105,
            lg: 120,
          },
          boxShadow: 'inset 0px 0px 15px 1px #000',
        }}
      >
        <Typography
          fontWeight='fontWeightBold'
          align='center'
          sx={{
            fontSize: {
              xs: '2.5rem',
              md: '4rem',
              lg: '4.5rem',
            },
            textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000',
          }}
        >
          {position}
        </Typography>
      </Box>
    </Box>
  )
}
