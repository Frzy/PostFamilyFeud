import * as React from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'

import type { Game } from '@/types/types'
import { BASE_GAME } from '@/utility/constants'

interface CreateGameProps {
  onCreate?: (game: Game) => void
  onExit?: () => void
}
export default function CreateGame({ onCreate, onExit }: CreateGameProps) {
  const [game, setGame] = React.useState<Game>(BASE_GAME)

  function handleTotalRoundChange(event: SelectChangeEvent) {
    const prevGame = game ? game : { ...BASE_GAME }

    setGame({ ...prevGame, totalRounds: parseInt(event.target.value as string) })
  }

  return (
    <Box>
      <Paper sx={{ mt: 1, p: 2 }}>
        <Typography>Please fill the form out below to create a Family Fued game.</Typography>
      </Paper>
      <Paper sx={{ mt: 1, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              label='Team One Name'
              value={game.teamOne.name}
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { value: name } = event.target
                setGame({
                  ...game,
                  teamOne: { ...game.teamOne, name },
                })
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Team One Starting Points'
              value={game.teamOne.points}
              error={isNaN(parseInt(`${game.teamOne.points}`))}
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { value } = event.target
                const points = parseInt(value)

                setGame({
                  ...game,
                  teamOne: {
                    ...game.teamOne,
                    points: isNaN(points) ? (value as unknown as number) : points,
                  },
                })
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label='Team Two Name'
              value={game.teamTwo.name}
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { value: name } = event.target
                setGame({
                  ...game,
                  teamTwo: { ...game.teamTwo, name },
                })
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Team Two Starting Points'
              value={game.teamTwo.points}
              error={isNaN(parseInt(`${game.teamTwo.points}`))}
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { value } = event.target
                const points = parseInt(value)

                setGame({
                  ...game,
                  teamTwo: {
                    ...game.teamTwo,
                    points: isNaN(points) ? (value as unknown as number) : points,
                  },
                })
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id='total-rounds-label'>Total Rounds</InputLabel>
              <Select
                labelId='total-rounds-label'
                id='total-rounds'
                value={`${game.totalRounds}`}
                label='Total Rounds'
                onChange={handleTotalRoundChange}
              >
                <MenuItem value={1}>One</MenuItem>
                <MenuItem value={2}>Two</MenuItem>
                <MenuItem value={3}>Three</MenuItem>
                <MenuItem value={4}>Four</MenuItem>
                <MenuItem value={5}>Five</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      {(onCreate || onExit) && (
        <Container
          maxWidth='xl'
          disableGutters
          sx={{
            position: 'fixed',
            bottom: -1,
            left: 0,
            right: 0,
            height: 57,
          }}
        >
          <Paper
            square
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
              px: 3,
            }}
            elevation={3}
          >
            {onExit ? <Button onClick={onExit}>Cancel</Button> : <div />}
            {onCreate ? (
              <Button
                size='large'
                onClick={() => {
                  if (onCreate) onCreate(game)
                }}
                disabled={
                  !game.teamOne.name ||
                  !game.teamTwo.name ||
                  isNaN(parseInt(`${game.teamOne.points}`)) ||
                  isNaN(parseInt(`${game.teamTwo.points}`))
                }
              >
                Submit
              </Button>
            ) : (
              <div />
            )}
          </Paper>
        </Container>
      )}
    </Box>
  )
}
