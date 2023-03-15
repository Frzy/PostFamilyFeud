import type { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio'

import type { Question, Answer } from '@/types/types'

type QueryParams = {
  q?: string
  answerCount?: string
  page?: string
}

const FEUD_QUESTIONS_URL = 'https://www.familyfeudquestions.com/Index/question_vote'
const FEUD_QUERY_URL = 'https://www.familyfeudquestions.com/Index/search'

const NO_CAP_DICT = [
  'a',
  'above',
  'across',
  'against',
  'along',
  'among',
  'an',
  'and',
  'around',
  'at',
  'be',
  'before',
  'behind',
  'below',
  'beneath',
  'between',
  'but',
  'by',
  'down',
  'down',
  'for',
  'from',
  'in',
  'near',
  'nor',
  'of',
  'off',
  'on',
  'or',
  'so',
  'the',
  'to',
  'toward',
  'upon',
  'with',
  'within',
  'yet',
]
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
function formatter(str: string) {
  return capitalize(
    str.toLowerCase().replace(/\b\w+(?:'\w+)*\b/g, (m) => {
      return NO_CAP_DICT.includes(m) ? m : capitalize(m)
    }),
  )
}

function sanatize(str: string) {
  return str
    .trim()
    .replace(/\u2019/g, "'")
    .replace(/(\u201c|\u201d)/g, '"')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q, answerCount, page } = req.query as QueryParams
  let url

  if (q) {
    url = new URL(FEUD_QUERY_URL)
    url.search = new URLSearchParams({ keyword: q, p: page ? page : '1' }).toString()
  } else if (answerCount) {
    url = new URL(FEUD_QUESTIONS_URL)
    url.search = new URLSearchParams({ limit: answerCount, p: page ? page : '1' }).toString()
  } else {
    url = new URL(FEUD_QUESTIONS_URL)
  }

  const response = await fetch(url)
  const body = await response.text()
  const questions: Question[] = []
  const $ = cheerio.load(body)

  $('.row.display .item').each(function () {
    const text = $(this).find('h3').text()
    const answers: Answer[] = []

    $(this)
      .find('.answer span')
      .each(function () {
        const answerLongText = $(this).text()
        const [answerText, pointString] = answerLongText.split(/\s{3,}/)
        if (!pointString) return
        const match = pointString.match(/\d{1,}/)
        const points = match ? match[0] : '0'

        if (points && answerText.length) {
          answers.push({
            text: formatter(sanatize(answerText)),
            points: parseInt(points),
            isAnswered: false,
            showAnswer: false,
          })
        }
      })

    if (answers.length && text) {
      questions.push({
        text: formatter(sanatize(text)),
        answers,
      })
    }
  })

  res.status(200).json(questions)
}
