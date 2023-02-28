import { BLUE_BOX_STYLE_FLEX } from '@/utility/constants'
import Box, { BoxProps } from '@mui/material/Box'

export default function BlankBoardTile({ ...other }: BoxProps) {
  return (
    <Box
      {...other}
      sx={{
        ...BLUE_BOX_STYLE_FLEX,
        ...other.sx,
      }}
    />
  )
}
