import type { Question } from './data'

/** Shared context block for one catalog question (matches QuestionChat semantics). */
export function buildQuestionContext(q: Question): string {
  const lines = [
    `Question title: ${q.title}`,
    `Category: ${q.category}`,
    `Difficulty: ${q.difficulty}`,
  ]
  if (q.tags.length) lines.push(`Tags: ${q.tags.join(', ')}`)
  if (q.companies.length) lines.push(`Companies (where this often comes up): ${q.companies.join(', ')}`)
  lines.push('', 'Description:', q.description)
  return lines.join('\n')
}

/** Reference answer appendix for prompts (empty string when unused). */
export function buildReferenceAnswerBlock(q: Question): string {
  if (!q.answer.trim()) return ''
  return `

Reference answer (context only—do not paste verbatim unless it helps the learner):
${q.answer}`
}

/** Multiple catalog entries for OpenChat / RAG-style system prompts. */
export function buildCatalogSnippetsForPrompt(questions: Question[], includeAnswers: boolean): string {
  if (questions.length === 0) return ''
  return questions
    .map((q, i) => {
      const header = `--- Catalog entry ${i + 1} (id: ${q.id}) ---`
      const body = buildQuestionContext(q)
      const ref = includeAnswers ? buildReferenceAnswerBlock(q) : ''
      return `${header}\n${body}${ref}`
    })
    .join('\n\n')
}
