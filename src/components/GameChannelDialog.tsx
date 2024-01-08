import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material'
import React from 'react'

interface GameChannelDialogProps extends Omit<DialogProps, 'onSubmit'> {
  onSubmit: (gameChannel: string, rememberMe: boolean) => void
}

export default function GameChannelDialog({
  onSubmit,
  ...other
}: GameChannelDialogProps): JSX.Element {
  const [gameChannel, setGameChannel] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)

  return (
    <Dialog {...other}>
      <DialogContent>
        <Box>
          <Stack spacing={1}>
            <Typography>
              Please supply the game channel name that will be used for this session.
            </Typography>
            <Alert severity='info'>
              Make sure the game channel name match between the Board, Question Picker and Host.
            </Alert>
            <TextField
              label='Game Channel'
              placeholder='Enter Game Channel'
              value={gameChannel}
              onChange={(event) => setGameChannel(event.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
              }
              label='Remember Game Channel'
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!gameChannel}
          onClick={() => {
            onSubmit(gameChannel, rememberMe)
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
