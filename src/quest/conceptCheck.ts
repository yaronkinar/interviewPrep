/**
 * Lightweight regex-based detection of language constructs in user code.
 * Strips comments and strings before matching so the keywords inside them
 * don't satisfy the check. Not a real AST — but good enough to enforce that
 * a level was solved using the intended JS feature, not brute force.
 */

function stripCommentsAndStrings(source: string): string {
  let out = ''
  let i = 0
  while (i < source.length) {
    const c = source[i]
    const next = source[i + 1]
    if (c === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i++
    } else if (c === '/' && next === '*') {
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++
      i += 2
    } else if (c === '"' || c === "'" || c === '`') {
      const quote = c
      i++
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i += 2
        else i++
      }
      i++
    } else {
      out += c
      i++
    }
  }
  return out
}

export type ConceptRule =
  | { kind: 'regex'; pattern: RegExp; message: string }
  | { kind: 'forbid'; pattern: RegExp; message: string }

/** Returns null when all rules pass; otherwise the first failure message. */
export function checkConcept(source: string, rules: ConceptRule[]): string | null {
  const cleaned = stripCommentsAndStrings(source)
  for (const rule of rules) {
    if (rule.kind === 'regex' && !rule.pattern.test(cleaned)) return rule.message
    if (rule.kind === 'forbid' && rule.pattern.test(cleaned)) return rule.message
  }
  return null
}

export const RULES = {
  arrowFunction: { kind: 'regex', pattern: /=>/, message: 'Use an arrow function (=>)' } as ConceptRule,
  arrayMethod: {
    kind: 'regex',
    pattern: /\.(?:filter|map|reduce|forEach|some|every|find)\s*\(/,
    message: 'Use an array method like .filter, .map, .reduce, or .forEach',
  } as ConceptRule,
  closure: {
    kind: 'regex',
    pattern: /function\s+make\w*|const\s+make\w*\s*=|let\s+make\w*\s*=/,
    message: 'Define a closure factory like makeCounter()',
  } as ConceptRule,
  asyncAwait: {
    kind: 'regex',
    pattern: /\bawait\b/,
    message: 'Use await — the gate is timed.',
  } as ConceptRule,
  promiseAll: {
    kind: 'regex',
    pattern: /Promise\.all\s*\(/,
    message: 'Use Promise.all to scout in parallel.',
  } as ConceptRule,
  bind: {
    kind: 'regex',
    pattern: /\.bind\s*\(|=>\s*\w+\.\w+\(/,
    message: 'Bind `this` (use .bind or wrap in an arrow).',
  } as ConceptRule,
  destructuring: {
    kind: 'regex',
    pattern: /\{\s*x\s*,\s*y\s*\}/,
    message: 'Destructure { x, y } from hero.pos.',
  } as ConceptRule,
  spread: {
    kind: 'regex',
    pattern: /\.\.\./,
    message: 'Use spread (...) to pass the inventory.',
  } as ConceptRule,
  higherOrder: {
    kind: 'regex',
    pattern: /function\s+\w+\s*\([^)]*\bfn\b|const\s+\w+\s*=\s*\([^)]*\bfn\b/,
    message: 'Write a higher-order function that takes another function as a parameter.',
  } as ConceptRule,
}
