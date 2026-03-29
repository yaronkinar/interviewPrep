import type { Question } from './data'

export type MockTrainingStyle =
  | 'understand'
  | 'verbal_practice'
  | 'interviewer'
  | 'code_review'

export const MOCK_TRAINING_OPTIONS: {
  id: MockTrainingStyle
  label: string
  blurb: string
}[] = [
  {
    id: 'understand',
    label: 'Understand & approach',
    blurb: 'Coach walks through what the question tests, how to frame an answer, and common pitfalls—without dumping a full solution unless you ask.',
  },
  {
    id: 'verbal_practice',
    label: 'Verbal answer practice',
    blurb: 'You write what you would say out loud; Claude gives structured feedback on clarity, structure, gaps, and follow-ups you might hear.',
  },
  {
    id: 'interviewer',
    label: 'Interviewer role-play',
    blurb: 'Claude acts as the interviewer. You reply as the candidate using a VS Code–style editor for code plus optional verbal notes—like a live coding round.',
  },
  {
    id: 'code_review',
    label: 'Code review',
    blurb: 'Write code in a VS Code–style editor, send it (plus optional notes) for interview-style review—correctness, edges, complexity, and narration.',
  },
]

function buildQuestionContext(q: Question): string {
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

function referenceBlock(q: Question, include: boolean): string {
  if (!include || !q.answer.trim()) return ''
  return `

Reference solution (context only—do not recite verbatim unless it helps the learner):
${q.answer}`
}

export function buildMockSystemPrompt(
  q: Question,
  style: MockTrainingStyle,
  includeRefAnswer: boolean,
): string {
  const base = buildQuestionContext(q)
  const ref = referenceBlock(q, includeRefAnswer)

  switch (style) {
    case 'understand':
      return `You are a friendly technical interview coach for frontend and JavaScript interviews.

${base}${ref}

Help the user understand the problem, what interviewers are looking for, and how to structure an approach. Compare trade-offs when relevant. Only give a complete coded solution if they clearly ask for it.`

    case 'verbal_practice':
      return `You are a technical interview coach reviewing how the user would answer out loud.

${base}${ref}

The user will describe their interview answer in natural language (not necessarily perfect code). Respond with concise, structured feedback:
1. **What worked** — strengths in reasoning or communication
2. **Gaps** — missing edge cases, unclear complexity, or weak structure
3. **Sharpen** — one or two concrete phrases or ordering tweaks they could use
4. **Follow-ups** — questions an interviewer might ask next

Stay practical; avoid rewriting their entire answer unless they ask.`

    case 'interviewer':
      return `You are a senior engineer conducting a realistic technical interview (frontend / JS).

${base}${ref}

The candidate may reply with TypeScript/TSX in a fenced code block plus optional spoken-style notes in the same message—treat that as what they would show in an IDE or whiteboard alongside what they say out loud.

Rules:
- Keep each message short (roughly what fits in a live interview turn).
- Start by briefly restating the problem in your own words, then ask for their high-level approach.
- After each candidate reply, give at most one focused follow-up, a small hint, or move to the next phase (e.g. complexity, edge cases)—do not lecture at length.
- Sound natural and professional, not like a textbook.`

    case 'code_review':
      return `You are a senior engineer reviewing the candidate's code for an interview-style question.

${base}${ref}

The user will paste their solution. Review:
- Correctness and edge cases
- Time and space complexity (and whether they stated them clearly)
- Readability and naming
- How they could narrate the solution more clearly in an interview

Be direct and kind. Prefer bullets. Only provide a full rewrite if they ask.`
  }
}

/** User message to kick off streaming when the session opens (styles that auto-start). */
export function getMockAutoStartUserMessage(style: MockTrainingStyle): string | null {
  switch (style) {
    case 'understand':
      return `Explain this interview question for me: what it is testing, how you would approach it in an interview (steps, not necessarily full code), and common pitfalls. Stay concise; do not give a complete solution unless I ask in a follow-up.`
    case 'interviewer':
      return `I'm ready. Please start the mock interview: briefly state the problem, then ask me for my approach.`
    default:
      return null
  }
}

export function mockStyleUsesAutoStart(style: MockTrainingStyle): boolean {
  return getMockAutoStartUserMessage(style) != null
}
