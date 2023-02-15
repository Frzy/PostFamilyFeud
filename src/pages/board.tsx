import * as React from 'react'
import { configureAbly } from '@ably-labs/react-hooks'
import * as Ably from 'ably'
import Head from 'next/head'

import { Container, Typography } from '@mui/material'
import Board from '@/components/board'

import type { Game, Question } from '@/types/types'
import { ABLY_CHANNEL, ABLY_EVENTS } from '@/utility/constants'

export default function BoardView() {
  const [channel, setChannel] = React.useState<Ably.Types.RealtimeChannelPromise | null>(null)
  const [game, setGame] = React.useState<Game>()
  const [question, setQuestion] = React.useState<Question>()

  React.useEffect(() => {
    const ably: Ably.Types.RealtimePromise = configureAbly({
      authUrl: '/api/authentication/token-auth',
    })
    const _channel = ably.channels.get(ABLY_CHANNEL)
    _channel.subscribe(ABLY_EVENTS.GAME_CHANGE, (message: Ably.Types.Message) => {
      const newGame: Game = message.data

      setGame(newGame)
    })
    _channel.subscribe(ABLY_EVENTS.QUESTION_CHANGE, (message: Ably.Types.Message) => {
      const newQuestion: Question = message.data

      setQuestion(newQuestion)
    })
    setChannel(_channel)

    return () => {
      _channel.unsubscribe()
    }
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>91 Family Feud</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Container maxWidth='xl' sx={{ minWidth: 350 }}>
        <Board question={question} game={game} multiple={1} />
      </Container>
    </React.Fragment>
  )
}
