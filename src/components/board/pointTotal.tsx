import * as React from 'react'
import { BLUE_BOX_STYLE_FLEX } from '@/utility/constants'
import { Box, Typography } from '@mui/material'

interface NumberAnswerBoxProps {
  total: number
}
export default function PointTotal({ total }: NumberAnswerBoxProps) {
  return (
    <Box
      sx={{
        ...BLUE_BOX_STYLE_FLEX,
        height: {
          xs: 100,
          md: 150,
        },
        width: {
          xs: 150,
          md: 200,
        },
      }}
    >
      <Typography
        fontWeight='fontWeightBold'
        align='center'
        sx={{
          fontSize: {
            xs: 56,
            md: 104,
          },
          textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000',
        }}
      >
        {total}
      </Typography>
    </Box>
  )
}
