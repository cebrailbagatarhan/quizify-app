export function isQuizQuestion(question) {
  return Boolean(
    question &&
      typeof question === 'object' &&
      typeof question.question === 'string' &&
      question.question.trim().length > 0 &&
      Array.isArray(question.options) &&
      question.options.length >= 2 &&
      question.options.every(
        (option) => typeof option === 'string' && option.trim().length > 0
      ) &&
      Number.isInteger(question.correctAnswer) &&
      question.correctAnswer >= 0 &&
      question.correctAnswer < question.options.length
  )
}

export function normalizeQuizResponse(payload) {
  const questions = Array.isArray(payload) ? payload : payload?.questions

  if (
    !Array.isArray(questions) ||
    questions.length === 0 ||
    !questions.every(isQuizQuestion)
  ) {
    return null
  }

  return questions
}
