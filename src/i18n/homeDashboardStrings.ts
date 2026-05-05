/** Stitch dashboard (screen 10) copy — English-first; extend per locale later. */
export const HOME_DASHBOARD_STRINGS = {
  greetingSignedOut: 'Welcome',
  greetingSignedInPrefix: 'Hello',
  streakLabel: 'Practice streak',
  streakDays: '{days}-day streak',
  streakHint: 'Keep visiting modules to build your streak.',
  dailyChallengeLabel: 'Daily challenge',
  dailyChallengeStart: 'Start now',
  continueJourney: 'Continue journey',
  progressPercent: '{pct}% complete',
  lessonsDone: '{done}/{total} lessons',
  moduleChip: 'Learning module',
  secondaryCardLink: 'View module',
  mentorBadge: 'Beta access',
  mentorTitle: 'Need a hint on your code?',
  mentorLead:
    'Use Company Q&A and the mock interview to get structured feedback — practice explaining the “why” behind your implementation.',
  mentorPrimaryCta: 'Mock interview',
  mentorSecondaryCta: 'Browse Q&A',
  focusLeadFallback: 'Pick a module below and dive into interactive demos.',
  bentoLargeEyebrow: 'Featured track',
} as const

export type HomeDashboardStrings = typeof HOME_DASHBOARD_STRINGS
