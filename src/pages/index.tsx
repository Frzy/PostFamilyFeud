import * as React from 'react'
import Head from 'next/head'

import {
  Container,
  CardActionArea,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CardActions,
  Button,
} from '@mui/material'
import Image from 'next/image'

export default function Home() {
  const [showBoardLink, setShowBoardLink] = React.useState(false)
  const [showHostLink, setShowHostLink] = React.useState(false)
  const [showJudgeLink, setShowJudgeLink] = React.useState(false)
  const [showPickerLink, setShowPickerLink] = React.useState(false)

  return (
    <React.Fragment>
      <Head>
        <title>Post 91 Family Feud</title>
        <meta name='description' content='American Legion 91 Family Fued' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Container maxWidth='xl' sx={{ minWidth: 350, mb: 2 }}>
        <Typography variant='h1' align='center'>
          American Legion 91
        </Typography>
        <Typography variant='h1' align='center'>
          Family Feud
        </Typography>
        <Box display='flex' justifyContent='space-evenly' flexWrap='wrap' gap={2} pt={4}>
          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea href='/board'>
              {showBoardLink ? (
                <Box width='100%' display='flex' justifyContent='center'>
                  <Image
                    src='/images/board_qrcode.png'
                    alt='host qr code'
                    width={300}
                    height={300}
                  />
                </Box>
              ) : (
                <React.Fragment>
                  <CardMedia
                    component='img'
                    height='200'
                    image='./images/family-feud-board.jpg'
                    alt='family feud board'
                  />
                  <CardContent>
                    <Typography gutterBottom variant='h5' component='div'>
                      Board
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Display the Family Feud Answer Board with team scores.
                    </Typography>
                  </CardContent>
                </React.Fragment>
              )}
            </CardActionArea>
            <CardActions>
              <Button onClick={() => setShowBoardLink(!showBoardLink)}>
                {showBoardLink ? 'Hide' : 'Show'} Link
              </Button>
            </CardActions>
          </Card>
          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea href='/host'>
              {showHostLink ? (
                <Box width='100%' display='flex' justifyContent='center'>
                  <Image
                    src='/images/host_qrcode.png'
                    alt='host qr code'
                    width={300}
                    height={300}
                  />
                </Box>
              ) : (
                <React.Fragment>
                  <CardMedia
                    component='img'
                    height='200'
                    image='./images/family-feud-host.jpg'
                    alt='family feud host'
                  />
                  <CardContent>
                    <Typography gutterBottom variant='h5' component='div'>
                      Host
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Display the Family Feud Answer Board with team scores.
                    </Typography>
                  </CardContent>
                </React.Fragment>
              )}
            </CardActionArea>
            <CardActions>
              <Button onClick={() => setShowHostLink(!showHostLink)}>
                {showHostLink ? 'Hide' : 'Show'} Link
              </Button>
            </CardActions>
          </Card>
          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea href='/judge'>
              {showJudgeLink ? (
                <Box width='100%' display='flex' justifyContent='center'>
                  <Image
                    src='/images/judge_qrcode.png'
                    alt='host qr code'
                    width={300}
                    height={300}
                  />
                </Box>
              ) : (
                <React.Fragment>
                  <CardMedia
                    component='img'
                    height='200'
                    image='./images/family-feud-judge.webp'
                    alt='family feud judge'
                  />
                  <CardContent>
                    <Typography gutterBottom variant='h5' component='div'>
                      Judge
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Section for the judges to confirm or deny contestants responses to questions.
                    </Typography>
                  </CardContent>
                </React.Fragment>
              )}
            </CardActionArea>
            <CardActions>
              <Button onClick={() => setShowJudgeLink(!showJudgeLink)}>
                {showJudgeLink ? 'Hide' : 'Show'} Link
              </Button>
            </CardActions>
          </Card>

          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea href='/picker'>
              {showPickerLink ? (
                <Box width='100%' display='flex' justifyContent='center'>
                  <Image
                    src='/images/picker_qrcode.png'
                    alt='picker qr code'
                    width={300}
                    height={300}
                  />
                </Box>
              ) : (
                <React.Fragment>
                  <CardMedia
                    component='img'
                    height='200'
                    image='./images/family-feud-picker.png'
                    alt='family feud judge'
                  />
                  <CardContent>
                    <Typography gutterBottom variant='h5' component='div'>
                      Question Picker
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Section for a person to pick the quesitons for the game.
                    </Typography>
                  </CardContent>
                </React.Fragment>
              )}
            </CardActionArea>
            <CardActions>
              <Button onClick={() => setShowPickerLink(!showPickerLink)}>
                {showPickerLink ? 'Hide' : 'Show'} Link
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Container>
    </React.Fragment>
  )
}
