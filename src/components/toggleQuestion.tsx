import * as React from 'react'

import { Grid, GridProps, ToggleButton, ToggleButtonProps } from '@mui/material'

interface ToggleQuestionProps extends Omit<GridProps, 'onChange'> {
  question: React.ReactNode
  toggleButtonOneProps: ToggleButtonProps
  toggleButtonOneText?: React.ReactNode
  toggleButtonTwoProps: ToggleButtonProps
  toggleButtonTwoText?: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (event: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => void
}
export default function ToggleQuestion({
  question,
  toggleButtonOneProps,
  toggleButtonOneText = 'On',
  toggleButtonTwoProps,
  toggleButtonTwoText = 'Off',
  onChange,
  ...other
}: ToggleQuestionProps) {
  return (
    <Grid container spacing={1} {...other}>
      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
        {question}
      </Grid>

      <Grid item xs={6} md={3}>
        <ToggleButton fullWidth {...toggleButtonOneProps} onChange={onChange}>
          {toggleButtonOneText}
        </ToggleButton>
      </Grid>
      <Grid item xs={6} md={3}>
        <ToggleButton fullWidth {...toggleButtonTwoProps} onChange={onChange}>
          {toggleButtonTwoText}
        </ToggleButton>
      </Grid>
    </Grid>
  )
}
