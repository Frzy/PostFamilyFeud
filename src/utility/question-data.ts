import { readFile } from 'fs/promises';
import path from 'path';

const files = {
  3: 'three-answer-questions.json',
  4: 'four-answer-questions.json',
  5: 'five-answer-questions.json',
  6: 'six-answer-questions.json',
  7: 'seven-answer-questions.json',
} as const;

type QuestionType = keyof typeof files;

export async function getQuestions(questionType: QuestionType, page: number, limit = 50) {
  const fileId = Number(questionType);

  if (!(fileId in files)) {
    throw new Error('Invalid file');
  }

  const filePath = path.join(
    process.cwd(),
    'src/data',
    files[fileId as keyof typeof files]
  );

  const contents = await readFile(filePath, 'utf-8');
  const questions = JSON.parse(contents);

  const paginatedQuestions = questions.slice((page - 1) * limit, page * limit);

  return {
    questions: paginatedQuestions,
    totalPages: Math.ceil(questions.length / limit)
  }
}