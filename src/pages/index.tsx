import * as React from 'react'
import Head from 'next/head'
import { Inter } from '@next/font/google'

import {
  Container,
  CardActionArea,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
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
            </CardActionArea>
          </Card>
          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea href='/host'>
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
            </CardActionArea>
          </Card>
          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea href='/judge'>
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
                  Display the Family Feud Judge screen.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      </Container>
    </React.Fragment>
  )
}
