import * as React from 'react'
import * as Ably from 'ably'
import { configureAbly } from '@ably-labs/react-hooks'
import Head from 'next/head'
import store from 'store2'
import {
  ABLY_EVENTS,
  GAME_CHANNEL_KEY,
  MUSIC,
  MUSIC_SRC,
  SHOW_QUESTION_STRIKE_DELAY,
} from '@/utility/constants'
import { Box, Container, Zoom, Typography, Stack, Paper, Fab } from '@mui/material'
import Board from '@/components/board/board'
import Image from 'next/image'
import type { Game, RoundQuestion } from '@/types/types'
import { getGameChannel } from '@/utility/functions'
import GameChannelDialog from '@/components/GameChannelDialog'
import BroadcastsIcon from '@mui/icons-material/Podcasts'
import UpdateGameChannelDialog from '@/components/UpdateGameChannelDialog'
import { HideOnMouseStop } from 'react-hide-on-mouse-stop'

export default function BoardView() {
  const [gameChannel, setGameChannel] = React.useState<string | null>(
    store.get(GAME_CHANNEL_KEY, null),
  )
  const [showEditChannelDialog, setShowChannelEditDialog] = React.useState(false)
  const [game, setGame] = React.useState<Game>()
  const [question, setQuestion] = React.useState<RoundQuestion>()
  const [showStrike, setShowStrike] = React.useState(false)
  const [showQuestion, setShowQuestion] = React.useState(false)
  const [showScore, setShowScore] = React.useState(false)
  const [strikeSize, setStrikeSize] = React.useState(0)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const buzzerRef = React.useRef<HTMLAudioElement>(null)
  const dingRef = React.useRef<HTMLAudioElement>(null)

  const themeRef = React.useRef<HTMLAudioElement>(null)
  const gunsmokeEndRef = React.useRef<HTMLAudioElement>(null)
  const gunsmokeThemeRef = React.useRef<HTMLAudioElement>(null)
  const gunsmokeNextRef = React.useRef<HTMLAudioElement>(null)

  function playMusic(music: MUSIC, loop = false) {
    let refToPlay

    switch (music) {
      case MUSIC.THEME:
        refToPlay = themeRef
        break
      case MUSIC.GUNSMOKE_OPEN:
        refToPlay = gunsmokeThemeRef
        break
      case MUSIC.GUNSMOKE_END:
        refToPlay = gunsmokeEndRef
        break
      case MUSIC.GUNSMOKE_NEXT:
        refToPlay = gunsmokeNextRef
        break
    }

    if (refToPlay) playRef(refToPlay, loop)
  }
  function playRef(ref: React.RefObject<HTMLAudioElement>, loop = false) {
    if (ref.current) {
      stopAllMusic()
      ref.current.currentTime = 0
      ref.current.loop = loop
      ref.current.play()
    }
  }
  function stopAllMusic() {
    if (themeRef.current) {
      themeRef.current.pause()
      themeRef.current.loop = false
      themeRef.current.currentTime = 0
    }
    if (gunsmokeThemeRef.current) {
      gunsmokeThemeRef.current.pause()
      gunsmokeThemeRef.current.loop = false
      gunsmokeThemeRef.current.currentTime = 0
    }
    if (gunsmokeEndRef.current) {
      gunsmokeEndRef.current.pause()
      gunsmokeEndRef.current.loop = false
      gunsmokeEndRef.current.currentTime = 0
    }
    if (gunsmokeNextRef.current) {
      gunsmokeNextRef.current.pause()
      gunsmokeNextRef.current.loop = false
      gunsmokeNextRef.current.currentTime = 0
    }
  }
  function playDing() {
    try {
      if (dingRef.current) {
        dingRef.current.play()
      }
    } catch (error) {
      /* empty */
    }
  }
  function playStrike() {
    try {
      if (buzzerRef.current) {
        buzzerRef.current.play()
      }
    } catch (error) {
      /* empty */
    }
  }

  function handleWrongAnswer(newGame: Game) {
    setShowStrike(true)
    setGame(newGame)
  }
  function handleCorrectAnswer(newQuestion: RoundQuestion) {
    playDing()
    setQuestion(newQuestion)
  }

  function showTeamScores() {
    setShowScore(true)
    setShowQuestion(false)
  }
  function hideTeamScores() {
    setShowScore(false)
    setShowQuestion(false)
  }
  function handleResizeEvent() {
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect()

      setStrikeSize((bounds.width - 16) / 3)
    }
  }

  React.useEffect(() => {
    let _channel: Ably.Types.RealtimeChannelPromise | undefined

    if (gameChannel) {
      const ablyChannelName = getGameChannel(gameChannel)
      const ably: Ably.Types.RealtimePromise = configureAbly({
        authUrl: '/api/authentication/token-auth',
      })

      _channel = ably.channels.get(ablyChannelName)
      _channel.subscribe(ABLY_EVENTS.GAME_CHANGE, (message: Ably.Types.Message) => {
        const newGame: Game = message.data

        setGame(newGame)
      })
      _channel.subscribe(
        [ABLY_EVENTS.QUESTION_CHANGE, ABLY_EVENTS.PUBLISH_QUESITON],
        (message: Ably.Types.Message) => {
          const newQuestion: RoundQuestion = message.data

          setQuestion(newQuestion)
          if (newQuestion) hideTeamScores()
          stopAllMusic()
        },
      )
      _channel.subscribe(ABLY_EVENTS.WRONG_ANSWER, (message: Ably.Types.Message) => {
        const newGame: Game = message.data

        setShowQuestion(false)
        setTimeout(() => setShowQuestion(true), SHOW_QUESTION_STRIKE_DELAY)

        handleWrongAnswer(newGame)
      })
      _channel.subscribe(ABLY_EVENTS.CORRECT_ANSWER, (message: Ably.Types.Message) => {
        const newQuesiton: RoundQuestion = message.data

        handleCorrectAnswer(newQuesiton)
      })
      _channel.subscribe(ABLY_EVENTS.NEW_GAME, (message: Ably.Types.Message) => {
        const newGame: Game = message.data

        setGame(newGame)
        setQuestion(undefined)
        showTeamScores()
      })
      _channel.subscribe(ABLY_EVENTS.GAME_OVER, (message: Ably.Types.Message) => {
        const newGame: Game = message.data

        setGame(newGame)
        setQuestion(undefined)
        showTeamScores()
      })
      _channel.subscribe(ABLY_EVENTS.NEW_ROUND, (message: Ably.Types.Message) => {
        const newGame: Game = message.data

        setGame(newGame)
        setQuestion(undefined)
        showTeamScores()
      })
      _channel.subscribe(ABLY_EVENTS.SHOW_QUESTION, (message: Ably.Types.Message) => {
        const { show: newShowQuestion }: { show: boolean } = message.data

        setShowQuestion(newShowQuestion)
      })
      _channel.subscribe(ABLY_EVENTS.PLAY_MUSIC, (message: Ably.Types.Message) => {
        const { music }: { music: MUSIC } = message.data
        playMusic(music, true)
      })
      _channel.subscribe(ABLY_EVENTS.STOP_MUSIC, () => stopAllMusic())
    }

    return () => {
      if (_channel) _channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameChannel])

  React.useEffect(() => {
    window.addEventListener('resize', handleResizeEvent)
    handleResizeEvent()
    return () => {
      window.removeEventListener('resize', handleResizeEvent)
    }
  }, [])

  React.useEffect(() => {
    if (showStrike) {
      playStrike()
      window.setTimeout(() => {
        setShowStrike(false)
      }, 1000)
    }
  }, [showStrike])

  return (
    <React.Fragment>
      <Head>
        <title>91 Family Feud</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Container ref={containerRef} maxWidth='xl' sx={{ minWidth: 350, position: 'relative' }}>
        <Board
          question={question}
          game={game}
          showQuestion={showQuestion}
          spacing={1}
          sx={{ mt: 1 }}
        />
        <Zoom in={showStrike} mountOnEnter unmountOnExit>
          <Box
            position='absolute'
            top={0}
            bottom={0}
            right={0}
            left={0}
            display='flex'
            alignItems='center'
            justifyContent='center'
          >
            {game &&
              containerRef.current &&
              [...Array(game.strikes < 4 ? game.strikes : 1)].map((_, i) => (
                <Image
                  key={i}
                  src='/images/strike.png'
                  alt='strike'
                  width={strikeSize}
                  height={strikeSize}
                />
              ))}
          </Box>
        </Zoom>
        <Zoom in={game && showScore}>
          <Box
            position='absolute'
            top={0}
            bottom={0}
            right={0}
            left={0}
            display='flex'
            alignItems='center'
            justifyContent='center'
          >
            <Box
              sx={{
                py: { xs: 2, sm: 5 },
                px: 2,
                rowGap: 5,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                borderRadius: 2,
                width: { xs: 300, sm: '90%' },
                display: 'flex',
                justifyContent: 'space-evenly',
                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },
              }}
            >
              <Stack>
                <Typography variant='h1' fontWeight='fontWeightBold' align='center'>
                  {game?.teamOne.name}
                </Typography>
                <Paper variant='outlined' sx={{ p: 2, minWidth: { xs: 200, md: 300 } }}>
                  <Typography fontWeight='fontWeightBold' fontSize={100} align='center'>
                    {game?.teamOne.points}
                  </Typography>
                </Paper>
              </Stack>
              <Stack>
                <Typography variant='h1' fontWeight='fontWeightBold' align='center'>
                  {game?.teamTwo.name}
                </Typography>
                <Paper variant='outlined' sx={{ p: 2, minWidth: { xs: 200, md: 300 } }}>
                  <Typography fontWeight='fontWeightBold' fontSize={100} align='center'>
                    {game?.teamTwo.points}
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Box>
        </Zoom>
        <audio ref={dingRef} src={MUSIC_SRC.DING} />
        <audio ref={buzzerRef} src={MUSIC_SRC.BUZZER} />
        <audio ref={themeRef} src={MUSIC_SRC.FEUD_THEME} />
        <audio ref={gunsmokeEndRef} src={MUSIC_SRC.GUNSMOKE_END} />
        <audio ref={gunsmokeNextRef} src={MUSIC_SRC.GUNSMOKE_THEME} />
        <audio ref={gunsmokeThemeRef} src={MUSIC_SRC.GUNSMOKE_STAY_TUNED} />
        <GameChannelDialog
          open={!gameChannel}
          onSubmit={(newChannel, rememberMe) => {
            if (rememberMe) store.set(GAME_CHANNEL_KEY, newChannel)
            setGameChannel(newChannel)
          }}
        />
        <UpdateGameChannelDialog
          open={showEditChannelDialog}
          gameChannel={gameChannel ?? ''}
          onClose={() => setShowChannelEditDialog(false)}
          onSubmit={(newChannel, rememberMe) => {
            if (rememberMe) store.set(GAME_CHANNEL_KEY, newChannel)
            setGameChannel(newChannel)
          }}
        />
      </Container>
      {gameChannel && (
        <HideOnMouseStop delay={8000} hideCursor>
          <Fab
            variant='extended'
            size='small'
            color='primary'
            sx={{
              transition: (theme) =>
                theme.transitions.create('opacity', { duration: theme.transitions.duration.short }),
              position: 'fixed',
              right: 8,
              bottom: 8,
              opacity: 1,
            }}
            onClick={() => {
              setShowChannelEditDialog(true)
            }}
          >
            <BroadcastsIcon sx={{ mr: 1 }} />
            {gameChannel}
          </Fab>
        </HideOnMouseStop>
      )}
    </React.Fragment>
  )
}
