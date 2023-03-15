import * as React from 'react'

import {
  Badge,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
} from '@mui/material'
import HideIcon from '@mui/icons-material/VisibilityOff'
import ShowIcon from '@mui/icons-material/Visibility'

import type { ListQuestion } from '@/types/types'

interface QuestionListProps {
  questions: ListQuestion[]
  onShowAnswersToggle?: (index: number) => void
  onSelectToggle?: (index: number) => void
}
export default function QuestionList({
  questions,
  onShowAnswersToggle,
  onSelectToggle,
}: QuestionListProps) {
  return (
    <List disablePadding>
      {questions.map((q, i) => (
        <ListItem
          divider
          key={i}
          disablePadding
          secondaryAction={
            <IconButton
              onClick={() => {
                if (onShowAnswersToggle) onShowAnswersToggle(i)
              }}
            >
              <Badge
                badgeContent={q.showAnswers ? 0 : q.answers.length}
                color='secondary'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                {q.showAnswers ? <HideIcon /> : <ShowIcon />}
              </Badge>
            </IconButton>
          }
        >
          <ListItemButton
            onClick={() => {
              if (onSelectToggle) onSelectToggle(i)
            }}
            disableGutters
          >
            <ListItemIcon sx={{ ml: 1, minWidth: 42 }}>
              <Radio edge='start' tabIndex={-1} disableRipple value={i} checked={!!q.selected} />
            </ListItemIcon>
            <Box sx={{ flexGrow: 1, mr: 1 }}>
              <ListItemText sx={{ flexGrow: 1 }}>{q.text}</ListItemText>
            </Box>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
