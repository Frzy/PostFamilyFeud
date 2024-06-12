import type { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio'

import type { Question, Answer } from '@/types/types'
import { validateQuestions } from '@/utility/functions'

type QueryParams = {
  q?: string
  answerCount?: string
  page?: string
}

const FEUD_BASE_URL = 'https://www.familyfeudquestions.com'
const FEUD_QUESTIONS_URL = `${FEUD_BASE_URL}/points-questions`
const FEUD_QUERY_URL = `${FEUD_BASE_URL}/search`

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
  const newStr = str.replace(/^\d+.\s/, '')

  return capitalize(
    newStr.toLowerCase().replace(/\b\w+(?:'\w+)*\b/g, (m) => {
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
    url.search = new URLSearchParams({ keyword: q }).toString()
  } else if (answerCount) {
    url = new URL(`${FEUD_BASE_URL}/questions-with-${answerCount}-answers`)
    url.search = new URLSearchParams({ page: page ? page : '1' }).toString()
  } else {
    url = new URL(FEUD_QUESTIONS_URL)
  }

  const response = await fetch(url)
  const body = await response.text()
  const questions: Question[] = []
  const $ = cheerio.load(body)
  const currentPage = page ? parseInt(page) : 1
  let totalPages = 1

  $('.q-list li').each(function () {
    const text = $(this).find('h5 > a').text()
    const answers: Answer[] = []
    const tags: string[] = []

    $(this)
      .find('.ans span')
      .each(function () {
        const $badge = $(this).find('.badge')
        const pointString = $badge.text()
        $badge.remove()
        const answerText = $(this).text()
        const match = pointString ? pointString.match(/\d{1,}/) : '0'
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

    $(this)
      .find('.tags a')
      .each(function () {
        const tag = $(this).text()
        if (tag) tags.push(tag.toLowerCase())
      })

    if (answers.length && text) {
      questions.push({
        text: formatter(sanatize(text)),
        tags,
        answers,
      })
    }
  })

  $('.pagination .page-item a').each(function () {
    const $this = $(this)
    const text = $this.text()
    const href = $this.attr('href')

    if (text.toLowerCase() === 'last') {
      const urlParts = href?.split('?')

      if (urlParts && urlParts[1]) {
        const queryParams = new URLSearchParams(urlParts[1])
        const newPage = queryParams.get('page')

        if (newPage) {
          const pageNumber = parseInt(newPage)

          totalPages = Math.max(totalPages, isNaN(pageNumber) ? 1 : pageNumber)
        }
      }
    } else {
      const pageNumber = parseInt(text)

      totalPages = Math.max(totalPages, isNaN(pageNumber) ? 1 : pageNumber)
    }
  })

  const validQuestions = validateQuestions(questions)

  console.log(validQuestions)

  const questionResponse = {
    questions: validQuestions,
    page: currentPage,
    totalPages,
  }

  res.status(200).json(questionResponse)
}
