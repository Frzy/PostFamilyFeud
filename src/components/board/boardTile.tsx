import { BLUE_BOX_STYLE_FLEX } from '@/utility/constants'
import Box from '@mui/material/Box'
import * as React from 'react'
import AnsweredBoardTile from './answeredBoardTile'
import BlankBoardTile from './blankBoardTile'
import NumberedBoardTile from './numberedBoardTile'

interface BoardTileProps {
  answer?: string
  points?: number
  position?: number
  isBlank?: boolean
  showAnswer?: boolean
}
export default function BoardTile({
  isBlank,
  showAnswer,
  answer = '',
  points = 0,
  position = 0,
}: BoardTileProps) {
  const [hasFlipped, setHasFlipped] = React.useState(false)

  React.useEffect(() => {
    if (showAnswer === undefined || hasFlipped === showAnswer) return

    setHasFlipped(showAnswer)
  }, [showAnswer, hasFlipped])

  if (isBlank) return <BlankBoardTile />

  return (
    <Box
      sx={{
        perspective: 1000,
        ...BLUE_BOX_STYLE_FLEX,
        '& .flipped': { transform: 'rotateX(180deg)' },
      }}
    >
      <Box
        className={hasFlipped ? 'flipped' : undefined}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.8s',
          transformStyle: 'preserve-3d',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backfaceVisibility: 'hidden',
          }}
        >
          <NumberedBoardTile position={position} sx={{}} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}
        >
          <AnsweredBoardTile text={answer} points={points} />
        </Box>
      </Box>
    </Box>
  )
}
