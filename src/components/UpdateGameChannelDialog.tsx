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

interface UpdateGameChannelDialogProps extends Omit<DialogProps, 'onSubmit'> {
  onSubmit: (gameChannel: string, rememberMe: boolean) => void
  gameChannel?: string
}

export default function UpdateGameChannelDialogProps({
  gameChannel: defaultChannelName,
  onClose,
  onSubmit,
  ...other
}: UpdateGameChannelDialogProps): JSX.Element {
  const [gameChannel, setGameChannel] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)

  React.useEffect(() => {
    if (defaultChannelName) setGameChannel(defaultChannelName)
  }, [defaultChannelName])

  return (
    <Dialog onClose={onClose} {...other}>
      <DialogContent>
        <Box>
          <Stack spacing={1}>
            <Typography>Edit the game channel name below.</Typography>
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
          color='inherit'
          onClick={() => {
            if (onClose) onClose({}, 'escapeKeyDown')
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!gameChannel}
          color='primary'
          onClick={() => {
            onSubmit(gameChannel, rememberMe)
            if (onClose) onClose({}, 'escapeKeyDown')
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
