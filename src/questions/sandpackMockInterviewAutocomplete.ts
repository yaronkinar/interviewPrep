import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { localCompletionSource } from '@codemirror/lang-javascript'
import type { Extension } from '@codemirror/state'
import type { Question } from './data'

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, max)}…`
}

function completeInterviewProblem(context: CompletionContext, question: Question): CompletionResult | null {
  const afterDot = context.matchBefore(/INTERVIEW_PROBLEM\.([a-zA-Z_]*)$/)
  if (afterDot) {
    const typed = afterDot.text.slice('INTERVIEW_PROBLEM.'.length)
    const from = afterDot.from + 'INTERVIEW_PROBLEM.'.length
    const options = [
      {
        label: 'id',
        type: 'property',
        detail: question.id,
        info: question.id,
      },
      {
        label: 'title',
        type: 'property',
        detail: truncate(question.title, 72),
        info: question.title,
      },
      {
        label: 'category',
        type: 'property',
        detail: question.category,
        info: question.category,
      },
      {
        label: 'difficulty',
        type: 'property',
        detail: question.difficulty,
        info: question.difficulty,
      },
      {
        label: 'description',
        type: 'property',
        detail: truncate(question.description, 72),
        info: question.description,
      },
    ].filter((o) => o.label.startsWith(typed))

    if (options.length > 0) {
      return { from, options, validFor: /^[\w$]*$/ }
    }
  }

  const ident = context.matchBefore(/[A-Z_][A-Z0-9_]*$/)
  if (ident && ident.text.length >= 3 && 'INTERVIEW_PROBLEM'.startsWith(ident.text)) {
    if (ident.text === 'INTERVIEW_PROBLEM') return null
    return {
      from: ident.from,
      options: [
        {
          label: 'INTERVIEW_PROBLEM',
          type: 'constant',
          detail: 'readonly question metadata',
        },
      ],
    }
  }

  return null
}

/** CodeMirror extensions: Ctrl+Space, type-to-complete, locals + INTERVIEW_PROBLEM fields. */
export function mockInterviewSandpackAutocomplete(question: Question): Extension[] {
  return [
    autocompletion({
      activateOnTyping: true,
      defaultKeymap: true,
      maxRenderedOptions: 72,
      override: [
        (ctx) => completeInterviewProblem(ctx, question) ?? localCompletionSource(ctx),
      ],
    }),
  ]
}
