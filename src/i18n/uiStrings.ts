import type { Locale } from './locale'

type UiStrings = {
  theme: {
    label: string
    useLight: string
    useDark: string
  }
  pages: {
    jsTitle: string
    reactTitle: string
    sandboxTitle: string
    questionsTitle: string
    sandboxLead: string
  }
  common: {
    show: string
    hide: string
    send: string
    clearConversation: string
    you: string
    mode: string
  }
  questions: {
    customBadge: string
    explanationTitle: string
    explainHint: string
    thinkingTitle: string
    toggleThinking: string
    toggleAnswer: string
    toggleExample: string
    removeCustomQuestion: string
    source: string
    customQuestionsTitle: string
    customQuestionsHint: string
    chooseJsonFile: string
    removeAllCustom: string
    addFromPaste: string
    solveGuideTitle: string
    solveGuideSteps: string[]
    searchPlaceholder: string
    clearFilters: string
    questionsCountSuffix: string
    customCountSuffix: string
    company: string
    difficulty: string
    category: string
    emptyState: string
  }
}

const en: UiStrings = {
  theme: {
    label: 'Theme',
    useLight: 'Use light theme',
    useDark: 'Use dark theme',
  },
  pages: {
    jsTitle: 'JS Patterns',
    reactTitle: 'React Questions',
    sandboxTitle: 'React sandbox',
    questionsTitle: 'Company Interview Questions',
    sandboxLead:
      'Edit in a VS Code-style editor (Monaco, dark theme), compile TSX in the browser, and preview in an isolated iframe. Paste a full Claude reply from Company Q&A to extract code, or type directly in Preview.tsx.',
  },
  common: {
    show: 'Show',
    hide: 'Hide',
    send: 'Send',
    clearConversation: 'Clear conversation',
    you: 'You',
    mode: 'Mode',
  },
  questions: {
    customBadge: 'Custom',
    explanationTitle: '// explanation',
    explainHint:
      'Open Chat with Claude below for an AI walkthrough. Claude uses the full card (tags, companies, difficulty) and starts with an automatic explanation when the thread is empty. For TSX previews, use the React sandbox tab.',
    thinkingTitle: '// interview thinking process',
    toggleThinking: 'interview thinking process',
    toggleAnswer: 'answer',
    toggleExample: 'UI example',
    removeCustomQuestion: 'Remove custom question',
    source: 'source',
    customQuestionsTitle: 'Custom questions (JSON)',
    customQuestionsHint:
      'Upload a file or paste JSON: one object or an array. Each item needs title and description (strings). Optional: id, difficulty, category, answer, answerType, tags, companies, source.',
    chooseJsonFile: 'Choose JSON file',
    removeAllCustom: 'Remove all custom',
    addFromPaste: 'Add from paste',
    solveGuideTitle: 'How to solve questions',
    solveGuideSteps: [
      'Clarify requirements and constraints before coding.',
      'List edge cases and expected behavior for each one.',
      'Choose a baseline approach, then optimize if needed.',
      'Explain complexity in big-O terms for time and space.',
      'Implement in small steps and narrate decisions out loud.',
      'Validate with quick examples, then mention follow-ups.',
    ],
    searchPlaceholder: 'Search questions, topics, tags...',
    clearFilters: 'Clear filters',
    questionsCountSuffix: 'questions',
    customCountSuffix: 'custom',
    company: 'Company',
    difficulty: 'Difficulty',
    category: 'Category',
    emptyState: 'No questions match the current filters.',
  },
}

const he: UiStrings = {
  theme: {
    label: 'ערכת נושא',
    useLight: 'מצב בהיר',
    useDark: 'מצב כהה',
  },
  pages: {
    jsTitle: 'דפוסי JS',
    reactTitle: 'שאלות React',
    sandboxTitle: 'ארגז חול React',
    questionsTitle: 'שאלות ראיונות חברות',
    sandboxLead:
      'עריכה בעורך בסגנון VS Code (Monaco, תמה כהה), קומפילציית TSX בדפדפן ותצוגה מקדימה ב-iframe מבודד. אפשר להדביק תשובה מלאה של Claude מלשונית שאלות ותשובות, או לכתוב ישירות ב-Preview.tsx.',
  },
  common: {
    show: 'הצג',
    hide: 'הסתר',
    send: 'שלח',
    clearConversation: 'נקה שיחה',
    you: 'את/ה',
    mode: 'מצב',
  },
  questions: {
    customBadge: 'מותאם אישית',
    explanationTitle: '// הסבר',
    explainHint:
      'פתחו למטה את Chat with Claude להסבר מונחה AI. Claude משתמש בכל פרטי הכרטיס (תגיות, חברות, רמת קושי) ומתחיל בהסבר אוטומטי כשהשיחה ריקה. לתצוגות TSX השתמשו בלשונית React sandbox.',
    thinkingTitle: '// תהליך חשיבה לראיון',
    toggleThinking: 'תהליך חשיבה לראיון',
    toggleAnswer: 'תשובה',
    toggleExample: 'דוגמת UI',
    removeCustomQuestion: 'הסר שאלה מותאמת',
    source: 'מקור',
    customQuestionsTitle: 'שאלות מותאמות (JSON)',
    customQuestionsHint:
      'העלו קובץ או הדביקו JSON: אובייקט יחיד או מערך. כל פריט צריך title ו-description (מחרוזות). אופציונלי: id, difficulty, category, answer, answerType, tags, companies, source.',
    chooseJsonFile: 'בחר קובץ JSON',
    removeAllCustom: 'הסר את כולן',
    addFromPaste: 'הוסף מהדבקה',
    solveGuideTitle: 'איך לפתור שאלות',
    solveGuideSteps: [
      'הבהירו דרישות ומגבלות לפני כתיבה.',
      'רשמו מקרי קצה ומה מצופה בכל אחד.',
      'בחרו גישה בסיסית ואז בצעו אופטימיזציה לפי הצורך.',
      'הסבירו סיבוכיות זמן וזיכרון ב-big O.',
      'ממשו בצעדים קטנים והסבירו החלטות בקול.',
      'אמתו עם דוגמאות מהירות ואז ציינו המשכים אפשריים.',
    ],
    searchPlaceholder: 'חפש שאלות, נושאים, תגיות...',
    clearFilters: 'נקה סינונים',
    questionsCountSuffix: 'שאלות',
    customCountSuffix: 'מותאם',
    company: 'חברה',
    difficulty: 'רמת קושי',
    category: 'קטגוריה',
    emptyState: 'אין שאלות שמתאימות לסינון הנוכחי.',
  },
}

const OVERRIDES: Partial<Record<Locale, Partial<UiStrings>>> = {
  he,
}

export function getUiStrings(locale: Locale): UiStrings {
  const override = OVERRIDES[locale]
  if (!override) return en
  return {
    theme: { ...en.theme, ...(override.theme ?? {}) },
    pages: { ...en.pages, ...(override.pages ?? {}) },
    common: { ...en.common, ...(override.common ?? {}) },
    questions: { ...en.questions, ...(override.questions ?? {}) },
  }
}

