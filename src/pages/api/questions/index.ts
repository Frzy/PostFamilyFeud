import type { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio'

import type { QuestionType, AnswerType } from '@/utility/question'

const FEUD_QUESTIONS_URL = 'https://www.familyfeudquestions.com/Index/question_vote'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req
  const page = query?.page || 1

  const response = await fetch(`${FEUD_QUESTIONS_URL}/p/${page}`)
  const body = await response.text()
  const questions: QuestionType[] = []
  const $ = cheerio.load(body)

  $('.row.display .item').each(function () {
    const item = $(this)
    const text = $(this).find('h3').text()
    const answers: AnswerType[] = []

    $(this)
      .find('.answer span')
      .each(function () {
        const answerLongText = $(this).text()
        const answerText = answerLongText.split(/\d(.*)/s)
        const match = answerLongText.match(/\d+/)
        const points = match ? match.shift() : '0'

        if (points && answerText.length) {
          answers.push({
            text: answerText[0].trim(),
            points: parseInt(points),
            isAnswered: false,
          })
        }
      })

    if (answers.length && text) {
      questions.push({
        text,
        answers,
      })
    }
  })

  res.status(200).json(questions)
}
