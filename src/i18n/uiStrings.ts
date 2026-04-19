import type { Locale } from './locale'
import { mockInterviewEn, mockInterviewHe, type MockInterviewStrings } from './mockInterviewStrings'

export type UiStrings = {
  nav: {
    openMenu: string
    closeMenu: string
    menuLabel: string
  }
  theme: {
    label: string
    useLight: string
    useDark: string
  }
  pages: {
    jsTitle: string
    reactTitle: string
    cssTitle: string
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
    clearSearch: string
    /** Shown above a contextual excerpt when the questions list is filtered by search */
    searchMatchPreviewLabel: string
    clearFilters: string
    questionsCountSuffix: string
    customCountSuffix: string
    company: string
    difficulty: string
    category: string
    emptyState: string
    /** Company Q&A (Stitch) hero + sidebar */
    heroKicker: string
    heroLead: string
    sidebarPartnersTitle: string
    sidebarTopicsTitle: string
    featuredPrefix: string
    /** Use {count} for number of questions */
    viewAllQuestionsCta: string
    /** Search rail (Stitch Company Q&A) */
    toolbarAllCategories: string
    toolbarRecent: string
    toolbarSearch: string
    archivedSolution: string
    revealFull: string
    collapseCard: string
    /** React Questions Stitch list (editorial cards + rail) */
    heroTitleLine1: string
    companyTagsLabel: string
    filterDifficultyAll: string
    difficultyFoundational: string
    difficultyIntermediate: string
    difficultyArchitectural: string
    filterCategoryPlaceholder: string
    filterCategoryAll: string
    filterCompanyAll: string
    /** Use {count} */
    displayingQuestions: string
    thinkingProcessLabel: string
    editorialExplanationLabel: string
    saveQuestion: string
    savedQuestion: string
    shareAnalysis: string
    fullDocumentation: string
    loadMoreCta: string
    loadMoreFooter: string
    learningPathsTitle: string
    learningCurrentLabel: string
    /** Use {visible} and {total} */
    stitchRailProgress: string
    learningUpNextLabel: string
    learningUpNextHint: string
    learningProKicker: string
    learningProTitle: string
    learningLaunchEditor: string
  }
  js: {
    common: {
      implementation: string
      usage: string
      calcLabel: string
      scheduleLabel: string
      skipLabel: string
    }
    debounce: {
      title: string
      description: string
      delayUpdated: string
      inputPlaceholder: string
      keystrokes: string
      fired: string
      explainSteps: string[]
    }
    memoize: {
      title: string
      description: string
      cacheRebuilt: string
      runButton: string
      clearButton: string
      cacheHits: string
      computed: string
      cacheCleared: string
      explainSteps: string[]
      evictWord: string
    }
    throttle: {
      title: string
      description: string
      delayUpdated: string
      moveMouseHere: string
      mouseEvents: string
      fired: string
      explainSteps: string[]
    }
    lazy: {
      title: string
      description: string
      observerCreated: string
      resetButton: string
      total: string
      loaded: string
      pending: string
      imageWaiting: string
      usageReactHook: string
      explainSteps: string[]
      outsideViewport: string
    }
    sandbox: {
      title: string
      hint: string
      description: string
      runButton: string
      clearOutput: string
      reset: string
      outputLabel: string
    }
  }
  mockInterview: MockInterviewStrings
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

const en: UiStrings = {
  nav: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuLabel: 'Site navigation',
  },
  theme: {
    label: 'Theme',
    useLight: 'Use light theme',
    useDark: 'Use dark theme',
  },
  pages: {
    jsTitle: 'JS Patterns',
    reactTitle: 'React Questions',
    cssTitle: 'CSS Patterns',
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
    searchPlaceholder: 'Search questions, topics, companies, categories, tags...',
    clearSearch: 'Clear search',
    searchMatchPreviewLabel: 'Preview',
    clearFilters: 'Clear filters',
    questionsCountSuffix: 'questions',
    customCountSuffix: 'custom',
    company: 'Company',
    difficulty: 'Difficulty',
    category: 'Category',
    emptyState: 'No questions match the current filters.',
    heroKicker: 'Advanced Frontend Curriculum',
    heroTitleLine1: 'Mastering',
    heroLead:
      'A curated collection of professional-grade interview questions. From core JavaScript to system design, rigorously analyzed for the modern engineer.',
    sidebarPartnersTitle: 'Tier 1 Partners',
    sidebarTopicsTitle: 'Topic clusters',
    featuredPrefix: 'Featured:',
    viewAllQuestionsCta: 'View all {count} questions',
    toolbarAllCategories: 'All categories',
    toolbarRecent: 'Recent',
    toolbarSearch: 'Search',
    archivedSolution: 'Archived solution',
    revealFull: 'Reveal full',
    collapseCard: 'Show less',
    companyTagsLabel: 'Company tags',
    filterDifficultyAll: 'All difficulties',
    difficultyFoundational: 'Foundational',
    difficultyIntermediate: 'Intermediate',
    difficultyArchitectural: 'Architectural',
    filterCategoryPlaceholder: 'Categories',
    filterCategoryAll: 'All categories',
    filterCompanyAll: 'All companies',
    displayingQuestions: 'Displaying {count} questions',
    thinkingProcessLabel: 'Thinking process',
    editorialExplanationLabel: 'Editorial explanation',
    saveQuestion: 'Save question',
    savedQuestion: 'Saved',
    shareAnalysis: 'Share',
    fullDocumentation: 'Full documentation',
    loadMoreCta: 'Load more questions',
    loadMoreFooter: 'End of curated list',
    learningPathsTitle: 'Learning paths',
    learningCurrentLabel: 'Current focus',
    stitchRailProgress: 'Showing {visible} of {total}',
    learningUpNextLabel: 'Up next',
    learningUpNextHint: 'Tighten filters or load more to continue.',
    learningProKicker: 'Pro tip',
    learningProTitle: 'Run these questions in the live sandbox',
    learningLaunchEditor: 'Launch editor',
  },
  js: {
    common: {
      implementation: 'implementation',
      usage: 'usage',
      calcLabel: 'calc',
      scheduleLabel: 'schedule',
      skipLabel: 'skip',
    },
    debounce: {
      title: 'Debounce',
      description: 'Fires only after you stop typing for {delay}ms. Rapid keystrokes reset the timer.',
      delayUpdated: 'Delay updated to {delay}ms',
      inputPlaceholder: 'Type here…',
      keystrokes: 'Keystrokes',
      fired: 'Fired',
      explainSteps: [
        '`timer` holds the pending timeout and is shared via closure.',
        'Each call clears the previous timeout, resetting the countdown.',
        'A new timeout is scheduled; if no newer call arrives, `fn` runs.',
        '`fn` runs only after the caller is quiet for `delay` ms.',
      ],
    },
    memoize: {
      title: 'Memoize',
      description: 'Caches results by arguments. Same args -> instant return, no recomputation.',
      cacheRebuilt: 'Cache rebuilt - max size: {size}',
      runButton: 'compute fib(n)',
      clearButton: 'clear cache',
      cacheHits: 'Cache hits',
      computed: 'Computed',
      cacheCleared: 'Cache cleared',
      explainSteps: [
        '`cache` is a `Map` in closure state and persists across calls.',
        'Arguments are serialized with `JSON.stringify` into a stable key.',
        'Cache hit returns immediately with no extra computation.',
        'Cache miss computes, stores the value, and future identical calls hit.',
      ],
      evictWord: 'evict',
    },
    throttle: {
      title: 'Throttle',
      description: 'Move your mouse over the box. The handler fires at most once per {delay}ms.',
      delayUpdated: 'Delay updated to {delay}ms',
      moveMouseHere: 'Move mouse here',
      mouseEvents: 'Mouse events',
      fired: 'Fired',
      explainSteps: [
        '`lastCall` tracks the last execution time; `remaining` is time left.',
        'Every invocation clears pending trailing timeout to keep latest args.',
        'If window expired, fire immediately and update `lastCall`.',
        'Otherwise schedule a trailing call so the last burst call is preserved.',
      ],
    },
    lazy: {
      title: 'Lazy Loading',
      description:
        'Images are not fetched until they scroll into view. IntersectionObserver swaps data-src -> src on intersection.',
      observerCreated: 'Observer created - rootMargin: {margin}px',
      resetButton: 'Reset images',
      total: 'Total',
      loaded: 'Loaded',
      pending: 'Pending',
      imageWaiting: 'image {index} - waiting...',
      usageReactHook: 'usage (React hook)',
      explainSteps: [
        'Images start with `data-src`, so the browser does not fetch them immediately.',
        '`IntersectionObserver` detects when each watched image enters view.',
        'On intersection, copy `data-src` into `src` to trigger the fetch.',
        'Call `unobserve` so each image loads once only.',
        '`rootMargin` preloads slightly before visibility to avoid flashes.',
      ],
      outsideViewport: 'image still outside viewport',
    },
    sandbox: {
      title: 'Code Sandbox',
      hint: 'Ctrl + Enter to run',
      description: 'Write any JavaScript. memoize, debounce, and throttle are available as globals.',
      runButton: 'Run',
      clearOutput: 'Clear output',
      reset: 'Reset',
      outputLabel: '// output',
    },
  },
  mockInterview: mockInterviewEn,
}

const he: UiStrings = {
  nav: {
    openMenu: 'פתח תפריט',
    closeMenu: 'סגור תפריט',
    menuLabel: 'ניווט באתר',
  },
  theme: {
    label: 'ערכת נושא',
    useLight: 'מצב בהיר',
    useDark: 'מצב כהה',
  },
  pages: {
    jsTitle: 'דפוסי JS',
    reactTitle: 'שאלות React',
    cssTitle: 'דפוסי CSS',
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
    searchPlaceholder: 'חפש שאלות, נושאים, חברות, קטגוריות, תגיות...',
    clearSearch: 'נקה חיפוש',
    searchMatchPreviewLabel: 'תצוגה מקדימה',
    clearFilters: 'נקה סינונים',
    questionsCountSuffix: 'שאלות',
    customCountSuffix: 'מותאם',
    company: 'חברה',
    difficulty: 'רמת קושי',
    category: 'קטגוריה',
    emptyState: 'אין שאלות שמתאימות לסינון הנוכחי.',
    heroKicker: 'תוכנית לימודים מתקדמת לפרונטאנד',
    heroTitleLine1: 'שליטה ב',
    heroLead:
      'אוסף נבחר של שאלות ראיון ברמה מקצועית. מג׳אווהסקריפט ליבה ועד ארכיטקטורה — מנותח לעומק למהנדסים מודרניים.',
    sidebarPartnersTitle: 'שותפי דרג א׳',
    sidebarTopicsTitle: 'אשכולות נושא',
    featuredPrefix: 'מומלצים:',
    viewAllQuestionsCta: 'הצג את כל {count} השאלות',
    toolbarAllCategories: 'כל הקטגוריות',
    toolbarRecent: 'אחרונות',
    toolbarSearch: 'חיפוש',
    archivedSolution: 'פתרון בארכיון',
    revealFull: 'הצג הכל',
    collapseCard: 'הצג פחות',
    companyTagsLabel: 'תגיות חברות',
    filterDifficultyAll: 'כל רמות הקושי',
    difficultyFoundational: 'יסודי',
    difficultyIntermediate: 'בינוני',
    difficultyArchitectural: 'ארכיטקטורה',
    filterCategoryPlaceholder: 'קטגוריות',
    filterCategoryAll: 'כל הקטגוריות',
    filterCompanyAll: 'כל החברות',
    displayingQuestions: 'מוצגות {count} שאלות',
    thinkingProcessLabel: 'תהליך חשיבה',
    editorialExplanationLabel: 'הסבר עריכתי',
    saveQuestion: 'שמור שאלה',
    savedQuestion: 'נשמר',
    shareAnalysis: 'שיתוף',
    fullDocumentation: 'תיעוד מלא',
    loadMoreCta: 'טען עוד שאלות',
    loadMoreFooter: 'סוף הרשימה הנבחרת',
    learningPathsTitle: 'מסלולי למידה',
    learningCurrentLabel: 'מיקוד נוכחי',
    stitchRailProgress: 'מוצגות {visible} מתוך {total}',
    learningUpNextLabel: 'הבא בתור',
    learningUpNextHint: 'הדקו סינון או טענו עוד כדי להמשיך.',
    learningProKicker: 'טיפ מקצועי',
    learningProTitle: 'הריצו את השאלות בארגז החול החי',
    learningLaunchEditor: 'פתחו עורך',
  },
  js: en.js,
  mockInterview: mockInterviewHe,
}

const OVERRIDES: Partial<Record<Locale, Partial<UiStrings>>> = {
  he,
}

const JS_OVERRIDES: Partial<Record<Locale, DeepPartial<UiStrings['js']>>> = {
  he: {
    debounce: {
      inputPlaceholder: 'הקלידו כאן…',
      keystrokes: 'הקלדות',
      explainSteps: [
        '`timer` שומר את הטיימר הממתין ומשותף ב-closure.',
        'כל קריאה מבטלת את הטיימר הקודם ומאפסת את הספירה לאחור.',
        'נקבע טיימר חדש; אם לא מגיעה קריאה נוספת, `fn` מופעל.',
        '`fn` רץ רק אחרי שקט של `delay` מילישניות.',
      ],
    },
    memoize: {
      runButton: 'חשב fib(n)',
      clearButton: 'נקה מטמון',
      evictWord: 'פנה',
      explainSteps: [
        '`cache` הוא `Map` שנשמר ב-closure לאורך כל הקריאות.',
        'הארגומנטים מומרצים למפתח יציב עם `JSON.stringify`.',
        'בפגיעת cache מוחזר הערך מיד ללא חישוב נוסף.',
        'בהחטאת cache מריצים את `fn`, שומרים תוצאה, ופעם הבאה תהיה פגיעה.',
      ],
    },
    throttle: {
      moveMouseHere: 'הזיזו את העכבר כאן',
      mouseEvents: 'אירועי עכבר',
      explainSteps: [
        '`lastCall` עוקב אחרי זמן הריצה האחרון; `remaining` הוא הזמן שנותר.',
        'בכל קריאה מנקים timeout מושהה כדי להשתמש בארגומנטים העדכניים.',
        'אם חלון הזמן הסתיים, מפעילים מיד ומעדכנים `lastCall`.',
        'אחרת קובעים קריאה מושהית כך שהקריאה האחרונה לא תלך לאיבוד.',
      ],
    },
    lazy: {
      imageWaiting: 'תמונה {index} - ממתינה...',
      outsideViewport: 'התמונה עדיין מחוץ לאזור התצוגה',
      explainSteps: [
        'התמונות מוצגות עם `data-src`, ולכן הדפדפן לא טוען אותן מיד.',
        '`IntersectionObserver` מזהה מתי תמונה נכנסת לאזור הנראה.',
        'בעת חיתוך מעתיקים `data-src` ל-`src` וכך מתחילה ההורדה.',
        'קוראים ל-`unobserve` כדי שכל תמונה תיטען פעם אחת בלבד.',
        '`rootMargin` מאפשר טעינה מוקדמת קטנה כדי למנוע הבהובים.',
      ],
    },
    sandbox: { clearOutput: 'נקה פלט', reset: 'איפוס' },
    common: { calcLabel: 'חישוב', scheduleLabel: 'תזמון', skipLabel: 'דילוג' },
  },
  es: {
    common: {
      implementation: 'implementacion',
      usage: 'uso',
      calcLabel: 'calculo',
      scheduleLabel: 'programar',
      skipLabel: 'omitir',
    },
    debounce: {
      title: 'Debounce',
      description: 'Solo se ejecuta cuando dejas de escribir durante {delay} ms. Las pulsaciones rapidas reinician el temporizador.',
      delayUpdated: 'Retardo actualizado a {delay}ms',
      inputPlaceholder: 'Escribe aqui…',
      keystrokes: 'Pulsaciones',
      fired: 'Ejecutado',
      explainSteps: [
        '`timer` guarda el timeout pendiente y vive en el closure.',
        'Cada llamada limpia el timeout anterior y reinicia la cuenta.',
        'Se programa un nuevo timeout; si no hay otra llamada, `fn` se ejecuta.',
        '`fn` corre solo tras silencio de `delay` ms.',
      ],
    },
    memoize: {
      title: 'Memoize',
      description: 'Cachea resultados por argumentos. Mismos argumentos -> retorno instantaneo, sin recalculo.',
      cacheRebuilt: 'Cache reconstruida - tamano maximo: {size}',
      runButton: 'calcular fib(n)',
      clearButton: 'limpiar cache',
      cacheHits: 'Aciertos de cache',
      computed: 'Calculado',
      cacheCleared: 'Cache limpiada',
      evictWord: 'expulsar',
      explainSteps: [
        '`cache` es un `Map` en closure y persiste entre llamadas.',
        'Los argumentos se serializan con `JSON.stringify` para la clave.',
        'Hit de cache devuelve al instante sin recalcular.',
        'Miss de cache ejecuta `fn`, guarda el valor y luego habrá hit.',
      ],
    },
    throttle: {
      title: 'Throttle',
      description: 'Mueve el raton sobre la caja. El handler se ejecuta como maximo una vez cada {delay} ms.',
      delayUpdated: 'Retardo actualizado a {delay}ms',
      moveMouseHere: 'Mueve el raton aqui',
      mouseEvents: 'Eventos de raton',
      fired: 'Ejecutado',
      explainSteps: [
        '`lastCall` guarda la ultima ejecucion; `remaining` es el tiempo restante.',
        'Cada invocacion limpia el timeout pendiente para usar argumentos recientes.',
        'Si la ventana expiro, dispara de inmediato y actualiza `lastCall`.',
        'Si no, agenda llamada trailing para no perder la ultima invocacion.',
      ],
    },
    lazy: {
      title: 'Carga diferida',
      description: 'Las imagenes no se descargan hasta entrar en vista. IntersectionObserver cambia data-src -> src al intersectar.',
      observerCreated: 'Observer creado - rootMargin: {margin}px',
      resetButton: 'Reiniciar imagenes',
      total: 'Total',
      loaded: 'Cargadas',
      pending: 'Pendientes',
      imageWaiting: 'imagen {index} - esperando...',
      usageReactHook: 'uso (hook de React)',
      outsideViewport: 'la imagen sigue fuera del area visible',
      explainSteps: [
        'Las imagenes salen con `data-src`, asi el navegador no las pide al inicio.',
        '`IntersectionObserver` detecta cuando cada imagen entra en vista.',
        'Al intersectar, copia `data-src` en `src` y dispara la descarga.',
        'Se usa `unobserve` para que cada imagen cargue una sola vez.',
        '`rootMargin` precarga un poco antes para evitar parpadeos.',
      ],
    },
    sandbox: {
      title: 'Sandbox de codigo',
      hint: 'Ctrl + Enter para ejecutar',
      description: 'Escribe cualquier JavaScript. memoize, debounce y throttle estan disponibles como globales.',
      runButton: 'Ejecutar',
      clearOutput: 'Limpiar salida',
      reset: 'Reiniciar',
      outputLabel: '// salida',
    },
  },
  fr: {
    common: {
      implementation: 'implementation',
      usage: 'utilisation',
      calcLabel: 'calcul',
      scheduleLabel: 'planifier',
      skipLabel: 'ignorer',
    },
    debounce: {
      inputPlaceholder: 'Tapez ici…',
      keystrokes: 'Frappes',
      fired: 'Declenche',
      explainSteps: [
        '`timer` garde le timeout en attente dans la closure.',
        'Chaque appel annule le timeout precedent et relance le compte.',
        'Un nouveau timeout est planifie; sans nouvel appel, `fn` s execute.',
        '`fn` ne tourne qu apres `delay` ms de calme.',
      ],
    },
    memoize: {
      runButton: 'calculer fib(n)',
      clearButton: 'vider le cache',
      cacheHits: 'Succes du cache',
      computed: 'Calcule',
      evictWord: 'expulser',
      explainSteps: [
        '`cache` est une `Map` en closure qui persiste entre appels.',
        'Les arguments sont serialises via `JSON.stringify` pour la cle.',
        'Hit cache: retour immediat sans recalcul.',
        'Miss cache: execute `fn`, stocke le resultat, puis hit au prochain appel identique.',
      ],
    },
    throttle: {
      moveMouseHere: 'Bougez la souris ici',
      mouseEvents: 'Evenements souris',
      explainSteps: [
        '`lastCall` suit le dernier appel; `remaining` est le temps restant.',
        'Chaque invocation nettoie le timeout trailing pour garder les derniers args.',
        'Si la fenetre est expiree, on execute tout de suite et on met a jour `lastCall`.',
        'Sinon on planifie un appel trailing pour conserver le dernier evenement.',
      ],
    },
    lazy: {
      imageWaiting: 'image {index} - en attente...',
      usageReactHook: 'utilisation (hook React)',
      outsideViewport: "l'image est encore hors de la zone visible",
      explainSteps: [
        'Les images sont rendues avec `data-src`, donc pas de requete immediate.',
        '`IntersectionObserver` detecte l entree de chaque image dans la zone visible.',
        'A l intersection, `data-src` est copie vers `src` pour lancer le chargement.',
        '`unobserve` evite un second chargement de la meme image.',
        '`rootMargin` precharge juste avant l affichage pour eviter les flashs.',
      ],
    },
    sandbox: { title: 'Bac a code', hint: 'Ctrl + Entree pour executer', clearOutput: 'Vider la sortie', reset: 'Reinitialiser', outputLabel: '// sortie' },
  },
  de: {
    common: {
      usage: 'Verwendung',
      calcLabel: 'berechnung',
      scheduleLabel: 'planen',
      skipLabel: 'ueberspringen',
    },
    debounce: {
      inputPlaceholder: 'Hier tippen…',
      keystrokes: 'Tastenanschlage',
      explainSteps: [
        '`timer` halt den ausstehenden Timeout und lebt in der Closure.',
        'Jeder Aufruf storniert den vorherigen Timeout und startet den Countdown neu.',
        'Ein neuer Timeout wird geplant; ohne neuen Aufruf wird `fn` ausgefuhrt.',
        '`fn` lauft erst, wenn fur `delay` ms Ruhe ist.',
      ],
    },
    memoize: {
      runButton: 'fib(n) berechnen',
      clearButton: 'cache leeren',
      evictWord: 'entfernen',
      explainSteps: [
        '`cache` ist eine `Map` in der Closure und bleibt uber Aufrufe erhalten.',
        'Argumente werden mit `JSON.stringify` zu einem stabilen Schlussel serialisiert.',
        'Cache-Hit liefert sofort ohne Neuberechnung.',
        'Cache-Miss fuhrt `fn` aus, speichert das Ergebnis und trifft beim nachsten gleichen Aufruf.',
      ],
    },
    throttle: {
      moveMouseHere: 'Maus hier bewegen',
      mouseEvents: 'Mausereignisse',
      explainSteps: [
        '`lastCall` speichert den letzten Ausfuhrungszeitpunkt; `remaining` ist Restzeit.',
        'Jeder Aufruf leert den geplanten Timeout, damit die neuesten Argumente genutzt werden.',
        'Ist das Zeitfenster abgelaufen, wird sofort ausgefuhrt und `lastCall` aktualisiert.',
        'Sonst wird ein trailing Aufruf geplant, damit das letzte Event nicht verloren geht.',
      ],
    },
    lazy: {
      imageWaiting: 'bild {index} - wartet...',
      usageReactHook: 'verwendung (React Hook)',
      outsideViewport: 'bild ist noch ausserhalb des sichtbereichs',
      explainSteps: [
        'Bilder werden mit `data-src` gerendert, daher startet kein sofortiger Request.',
        '`IntersectionObserver` erkennt, wenn ein Bild in den sichtbaren Bereich kommt.',
        'Beim Eintritt wird `data-src` nach `src` kopiert und der Download startet.',
        'Mit `unobserve` wird jedes Bild nur einmal geladen.',
        '`rootMargin` ladt kurz vorher vor, um Flackern zu vermeiden.',
      ],
    },
    sandbox: { title: 'Code-Sandbox', hint: 'Ctrl + Enter zum Ausfuhren', clearOutput: 'Ausgabe leeren', outputLabel: '// ausgabe' },
  },
  pt: {
    common: { usage: 'Uso', calcLabel: 'calculo', scheduleLabel: 'agendar', skipLabel: 'ignorar' },
    debounce: {
      inputPlaceholder: 'Digite aqui…',
      keystrokes: 'Teclas',
      explainSteps: [
        '`timer` guarda o timeout pendente e vive na closure.',
        'Cada chamada limpa o timeout anterior e reinicia a contagem.',
        'Um novo timeout e agendado; sem nova chamada, `fn` executa.',
        '`fn` so roda apos `delay` ms de silencio.',
      ],
    },
    memoize: {
      runButton: 'calcular fib(n)',
      clearButton: 'limpar cache',
      evictWord: 'remover',
      explainSteps: [
        '`cache` e um `Map` na closure e persiste entre chamadas.',
        'Os argumentos sao serializados com `JSON.stringify` para formar a chave.',
        'Cache hit retorna na hora, sem recalcular.',
        'Cache miss executa `fn`, guarda o resultado e depois vira hit.',
      ],
    },
    throttle: {
      moveMouseHere: 'Mova o mouse aqui',
      mouseEvents: 'Eventos do mouse',
      explainSteps: [
        '`lastCall` guarda a ultima execucao; `remaining` e o tempo restante.',
        'Cada invocacao limpa o timeout pendente para usar os argumentos mais recentes.',
        'Se a janela expirou, dispara imediatamente e atualiza `lastCall`.',
        'Caso contrario, agenda chamada trailing para nao perder o ultimo evento.',
      ],
    },
    lazy: {
      imageWaiting: 'imagem {index} - aguardando...',
      usageReactHook: 'uso (hook React)',
      outsideViewport: 'a imagem ainda esta fora da area visivel',
      explainSteps: [
        'As imagens comecam com `data-src`, entao o navegador nao baixa de imediato.',
        '`IntersectionObserver` detecta quando cada imagem entra na area visivel.',
        'Na intersecao, copia `data-src` para `src` e inicia o download.',
        '`unobserve` garante carregamento unico por imagem.',
        '`rootMargin` antecipa um pouco para evitar piscadas.',
      ],
    },
    sandbox: { title: 'Sandbox de codigo', hint: 'Ctrl + Enter para executar', clearOutput: 'Limpar saida', outputLabel: '// saida' },
  },
  ja: {
    common: { usage: '使い方', calcLabel: '計算', scheduleLabel: '予約', skipLabel: 'スキップ' },
    debounce: {
      inputPlaceholder: 'ここに入力…',
      keystrokes: '入力回数',
      explainSteps: [
        '`timer` は保留中のタイマーを保持し、クロージャ内で共有されます。',
        '呼び出しのたびに前のタイマーを解除してカウントダウンをリセットします。',
        '新しいタイマーを設定し、次の呼び出しがなければ `fn` を実行します。',
        '`fn` は `delay` ミリ秒の静止後にのみ実行されます。',
      ],
    },
    memoize: {
      runButton: 'fib(n) を計算',
      clearButton: 'キャッシュをクリア',
      evictWord: '削除',
      explainSteps: [
        '`cache` はクロージャ内の `Map` で、呼び出し間で保持されます。',
        '引数は `JSON.stringify` でシリアライズされ、キーになります。',
        'キャッシュヒット時は再計算せず即時に返します。',
        'キャッシュミス時は `fn` を実行して保存し、次回同一引数でヒットします。',
      ],
    },
    throttle: {
      moveMouseHere: 'ここでマウスを動かす',
      mouseEvents: 'マウスイベント',
      explainSteps: [
        '`lastCall` は前回実行時刻、`remaining` は残り時間です。',
        '毎回 trailing のタイマーを解除し、最新引数を使えるようにします。',
        'ウィンドウが切れていれば即時実行して `lastCall` を更新します。',
        'そうでなければ trailing 実行を予約し、最後のイベントを捨てません。',
      ],
    },
    lazy: {
      imageWaiting: '画像 {index} - 待機中...',
      usageReactHook: '使い方 (React hook)',
      outsideViewport: '画像はまだ表示領域の外です',
      explainSteps: [
        '画像は `data-src` で描画されるため、最初は取得されません。',
        '`IntersectionObserver` が画像の表示領域への侵入を検知します。',
        '交差時に `data-src` を `src` にコピーして取得を開始します。',
        '`unobserve` で各画像の読み込みを1回に制限します。',
        '`rootMargin` で少し早めに先読みし、ちらつきを防ぎます。',
      ],
    },
    sandbox: { title: 'コードサンドボックス', hint: 'Ctrl + Enter で実行', clearOutput: '出力をクリア', outputLabel: '// 出力' },
  },
  zh: {
    common: { usage: '用法', calcLabel: '计算', scheduleLabel: '调度', skipLabel: '跳过' },
    debounce: {
      inputPlaceholder: '在此输入…',
      keystrokes: '按键次数',
      explainSteps: [
        '`timer` 保存待执行的定时器，并通过闭包共享。',
        '每次调用都会清除上一个定时器，重新开始倒计时。',
        '随后创建新定时器；若没有新调用，`fn` 执行。',
        '`fn` 只会在安静 `delay` 毫秒后触发。',
      ],
    },
    memoize: {
      runButton: '计算 fib(n)',
      clearButton: '清空缓存',
      evictWord: '淘汰',
      explainSteps: [
        '`cache` 是闭包中的 `Map`，会在多次调用间保留。',
        '参数通过 `JSON.stringify` 序列化为稳定键。',
        '命中缓存时直接返回，不再计算。',
        '未命中时执行 `fn` 并存储结果，下次同参将命中。',
      ],
    },
    throttle: {
      moveMouseHere: '在此移动鼠标',
      mouseEvents: '鼠标事件',
      explainSteps: [
        '`lastCall` 记录上次执行时间，`remaining` 为剩余窗口时间。',
        '每次调用都会清理待触发定时器，以保留最新参数。',
        '若窗口已过期则立即执行并更新 `lastCall`。',
        '否则安排尾部调用，保证最后一次事件不丢失。',
      ],
    },
    lazy: {
      imageWaiting: '图片 {index} - 等待中...',
      usageReactHook: '用法 (React Hook)',
      outsideViewport: '图片仍在可视区域外',
      explainSteps: [
        '图片先以 `data-src` 渲染，浏览器不会立即请求。',
        '`IntersectionObserver` 检测图片何时进入可视区域。',
        '相交时把 `data-src` 赋给 `src`，触发下载。',
        '调用 `unobserve`，保证每张图片只加载一次。',
        '`rootMargin` 可提前预取，减少白屏闪烁。',
      ],
    },
    sandbox: { title: '代码沙箱', hint: 'Ctrl + Enter 运行', clearOutput: '清空输出', outputLabel: '// 输出' },
  },
  ar: {
    common: { usage: 'الاستخدام', calcLabel: 'حساب', scheduleLabel: 'جدولة', skipLabel: 'تخطي' },
    debounce: {
      inputPlaceholder: 'اكتب هنا…',
      keystrokes: 'عدد الضغطات',
      explainSteps: [
        '`timer` يحتفظ بالمؤقت المعلّق ويتم مشاركته عبر closure.',
        'كل استدعاء يلغي المؤقت السابق ويعيد العد التنازلي.',
        'يتم جدولة مؤقت جديد؛ إذا لم يصل استدعاء جديد تُنفّذ `fn`.',
        'لا تعمل `fn` إلا بعد هدوء لمدة `delay` مللي ثانية.',
      ],
    },
    memoize: {
      runButton: 'احسب fib(n)',
      clearButton: 'امسح الذاكرة المؤقتة',
      evictWord: 'ازالة',
      explainSteps: [
        '`cache` عبارة عن `Map` داخل closure وتستمر عبر الاستدعاءات.',
        'يتم تحويل الوسائط إلى مفتاح ثابت باستخدام `JSON.stringify`.',
        'عند hit في cache يتم الإرجاع فورًا دون إعادة حساب.',
        'عند miss يتم تشغيل `fn` وتخزين النتيجة للاستدعاءات القادمة.',
      ],
    },
    throttle: {
      moveMouseHere: 'حرّك المؤشر هنا',
      mouseEvents: 'احداث الماوس',
      explainSteps: [
        '`lastCall` يتتبع وقت آخر تنفيذ، و`remaining` هو الوقت المتبقي.',
        'كل استدعاء ينظف المؤقت المؤجل لاستخدام أحدث الوسائط.',
        'إذا انتهت النافذة الزمنية يتم التنفيذ فورًا وتحديث `lastCall`.',
        'وإلا يتم جدولة تنفيذ لاحق حتى لا تضيع آخر دفعة أحداث.',
      ],
    },
    lazy: {
      imageWaiting: 'صورة {index} - بانتظار التحميل...',
      usageReactHook: 'الاستخدام (React hook)',
      outsideViewport: 'الصورة ما زالت خارج نطاق العرض',
      explainSteps: [
        'تُعرض الصور أولًا باستخدام `data-src` لذلك لا يبدأ التحميل مباشرة.',
        '`IntersectionObserver` يرصد دخول الصورة إلى منطقة العرض.',
        'عند التقاطع يتم نسخ `data-src` إلى `src` لبدء الجلب.',
        'يُستدعى `unobserve` كي تُحمّل كل صورة مرة واحدة فقط.',
        'يسمح `rootMargin` بالتحميل المسبق قبل الظهور لتقليل الوميض.',
      ],
    },
    sandbox: { title: 'بيئة كود', hint: 'Ctrl + Enter للتشغيل', clearOutput: 'امسح المخرجات', outputLabel: '// المخرجات' },
  },
  ru: {
    common: { usage: 'Использование', calcLabel: 'расчет', scheduleLabel: 'план', skipLabel: 'пропуск' },
    debounce: {
      inputPlaceholder: 'Введите здесь…',
      keystrokes: 'Нажатия',
      explainSteps: [
        '`timer` хранит ожидающий таймер и живет в замыкании.',
        'Каждый вызов отменяет предыдущий таймер и сбрасывает отсчет.',
        'Ставится новый таймер; если нового вызова нет, выполняется `fn`.',
        '`fn` запускается только после тишины в `delay` мс.',
      ],
    },
    memoize: {
      runButton: 'вычислить fib(n)',
      clearButton: 'очистить кеш',
      evictWord: 'вытеснить',
      explainSteps: [
        '`cache` — это `Map` в замыкании, сохраняется между вызовами.',
        'Аргументы сериализуются через `JSON.stringify` в стабильный ключ.',
        'При попадании в кеш возвращаем сразу, без вычислений.',
        'При промахе выполняем `fn`, сохраняем результат и далее получаем hit.',
      ],
    },
    throttle: {
      moveMouseHere: 'Двигайте мышь здесь',
      mouseEvents: 'События мыши',
      explainSteps: [
        '`lastCall` хранит время последнего запуска; `remaining` — остаток окна.',
        'Каждый вызов очищает отложенный таймер, чтобы использовать свежие аргументы.',
        'Если окно истекло, выполняем сразу и обновляем `lastCall`.',
        'Иначе планируем trailing-вызов, чтобы не потерять последнее событие.',
      ],
    },
    lazy: {
      imageWaiting: 'изображение {index} - ожидание...',
      usageReactHook: 'использование (React hook)',
      outsideViewport: 'изображение пока вне области видимости',
      explainSteps: [
        'Изображения рендерятся с `data-src`, поэтому не загружаются сразу.',
        '`IntersectionObserver` отслеживает вход изображения в область видимости.',
        'При пересечении переносим `data-src` в `src` и запускаем загрузку.',
        '`unobserve` гарантирует, что каждое изображение загрузится один раз.',
        '`rootMargin` делает небольшую предзагрузку, чтобы избежать миганий.',
      ],
    },
    sandbox: { title: 'Песочница кода', hint: 'Ctrl + Enter для запуска', clearOutput: 'Очистить вывод', outputLabel: '// вывод' },
  },
  hi: {
    common: { usage: 'उपयोग', calcLabel: 'गणना', scheduleLabel: 'शेड्यूल', skipLabel: 'स्किप' },
    debounce: {
      inputPlaceholder: 'यहां टाइप करें…',
      keystrokes: 'कीस्ट्रोक',
      explainSteps: [
        '`timer` pending timeout को closure में रखता है।',
        'हर कॉल पिछले timeout को clear करके countdown रीसेट करती है।',
        'फिर नया timeout set होता है; नई कॉल न आए तो `fn` चलती है।',
        '`fn` तभी चलती है जब `delay` ms तक इनपुट शांत रहे।',
      ],
    },
    memoize: {
      runButton: 'fib(n) गणना करें',
      clearButton: 'कैश साफ करें',
      evictWord: 'हटाएं',
      explainSteps: [
        '`cache` एक `Map` है जो closure में रहकर कॉल्स के बीच बना रहता है।',
        'Arguments को `JSON.stringify` से key में serialize किया जाता है।',
        'Cache hit पर तुरंत return होता है, दोबारा compute नहीं होता।',
        'Cache miss पर `fn` चलती है, value save होती है, अगली बार hit मिलता है।',
      ],
    },
    throttle: {
      moveMouseHere: 'यहां माउस घुमाएं',
      mouseEvents: 'माउस इवेंट',
      explainSteps: [
        '`lastCall` पिछला run time रखता है; `remaining` बचा समय बताता है।',
        'हर कॉल pending trailing timeout clear करती है ताकि latest args रहें।',
        'अगर window खत्म हो गई तो तुरंत run और `lastCall` update होता है।',
        'वरना trailing call schedule होती है ताकि आखिरी event ना छूटे।',
      ],
    },
    lazy: {
      imageWaiting: 'इमेज {index} - प्रतीक्षा में...',
      usageReactHook: 'उपयोग (React hook)',
      outsideViewport: 'इमेज अभी viewport के बाहर है',
      explainSteps: [
        'इमेज पहले `data-src` के साथ render होती हैं, इसलिए तुरंत fetch नहीं होतीं।',
        '`IntersectionObserver` देखता है कि इमेज viewport में कब आती है।',
        'Intersection पर `data-src` को `src` में कॉपी करके fetch शुरू होता है।',
        '`unobserve` से हर इमेज सिर्फ एक बार लोड होती है।',
        '`rootMargin` पहले से preload कर देता है ताकि blank flash न दिखे।',
      ],
    },
    sandbox: { title: 'कोड सैंडबॉक्स', hint: 'चलाने के लिए Ctrl + Enter', clearOutput: 'आउटपुट साफ करें', outputLabel: '// आउटपुट' },
  },
  pl: {
    common: { usage: 'Uzycie', calcLabel: 'obliczenie', scheduleLabel: 'plan', skipLabel: 'pomin' },
    debounce: {
      inputPlaceholder: 'Wpisz tutaj…',
      keystrokes: 'Nacisniecia',
      explainSteps: [
        '`timer` przechowuje oczekujacy timeout i jest wspoldzielony przez closure.',
        'Kazde wywolanie kasuje poprzedni timeout i resetuje odliczanie.',
        'Ustawiany jest nowy timeout; bez kolejnego wywolania uruchamia sie `fn`.',
        '`fn` wykona sie dopiero po ciszy trwajacej `delay` ms.',
      ],
    },
    memoize: {
      runButton: 'oblicz fib(n)',
      clearButton: 'wyczysc cache',
      evictWord: 'usun',
      explainSteps: [
        '`cache` to `Map` w closure i utrzymuje sie miedzy wywolaniami.',
        'Argumenty sa serializowane przez `JSON.stringify` do stabilnego klucza.',
        'Cache hit zwraca wynik od razu bez ponownego liczenia.',
        'Cache miss uruchamia `fn`, zapisuje wynik i kolejne wywolanie trafia w cache.',
      ],
    },
    throttle: {
      moveMouseHere: 'Przesun mysz tutaj',
      mouseEvents: 'Zdarzenia myszy',
      explainSteps: [
        '`lastCall` trzyma czas ostatniego uruchomienia; `remaining` to czas pozostaly.',
        'Kazde wywolanie czyści timeout trailing, by uzyc najnowszych argumentow.',
        'Jesli okno wygaslo, wykonanie jest natychmiastowe i `lastCall` jest aktualizowane.',
        'W przeciwnym razie planowane jest wywolanie trailing, by nie zgubic ostatniego eventu.',
      ],
    },
    lazy: {
      imageWaiting: 'obraz {index} - oczekiwanie...',
      usageReactHook: 'uzycie (hook React)',
      outsideViewport: 'obraz nadal jest poza obszarem widoku',
      explainSteps: [
        'Obrazy sa renderowane z `data-src`, wiec przegladarka nie pobiera ich od razu.',
        '`IntersectionObserver` wykrywa, kiedy obraz wchodzi do viewportu.',
        'Przy przecieciu kopiujemy `data-src` do `src`, co uruchamia pobieranie.',
        '`unobserve` sprawia, ze kazdy obraz laduje sie tylko raz.',
        '`rootMargin` pozwala ladowac chwile wczesniej, aby uniknac migniec.',
      ],
    },
    sandbox: { title: 'Piaskownica kodu', hint: 'Ctrl + Enter aby uruchomic', clearOutput: 'Wyczysc wynik', outputLabel: '// wynik' },
  },
  ko: {
    common: { usage: '사용법', calcLabel: '계산', scheduleLabel: '예약', skipLabel: '건너뜀' },
    debounce: {
      inputPlaceholder: '여기에 입력…',
      keystrokes: '입력 횟수',
      explainSteps: [
        '`timer` 는 대기 중인 타이머를 저장하며 클로저로 공유됩니다.',
        '매 호출마다 이전 타이머를 지워 카운트다운을 초기화합니다.',
        '새 타이머를 예약하고 추가 호출이 없으면 `fn` 이 실행됩니다.',
        '`fn` 은 `delay` ms 동안 입력이 멈춘 뒤에만 실행됩니다.',
      ],
    },
    memoize: {
      runButton: 'fib(n) 계산',
      clearButton: '캐시 지우기',
      evictWord: '제거',
      explainSteps: [
        '`cache` 는 클로저 안의 `Map` 이며 호출 간에 유지됩니다.',
        '인자는 `JSON.stringify` 로 직렬화되어 안정적인 키가 됩니다.',
        '캐시 히트 시 재계산 없이 즉시 반환합니다.',
        '캐시 미스 시 `fn` 실행 후 저장하며 다음 동일 호출은 히트합니다.',
      ],
    },
    throttle: {
      moveMouseHere: '여기서 마우스를 움직이세요',
      mouseEvents: '마우스 이벤트',
      explainSteps: [
        '`lastCall` 은 마지막 실행 시점, `remaining` 은 남은 시간입니다.',
        '매 호출마다 trailing 타이머를 지워 최신 인자를 사용합니다.',
        '윈도우가 만료되면 즉시 실행하고 `lastCall` 을 갱신합니다.',
        '그렇지 않으면 trailing 실행을 예약해 마지막 이벤트를 보존합니다.',
      ],
    },
    lazy: {
      imageWaiting: '이미지 {index} - 대기 중...',
      usageReactHook: '사용법 (React hook)',
      outsideViewport: '이미지가 아직 뷰포트 밖에 있습니다',
      explainSteps: [
        '이미지는 `data-src` 로 먼저 렌더링되어 즉시 요청되지 않습니다.',
        '`IntersectionObserver` 가 이미지의 뷰포트 진입을 감지합니다.',
        '교차 시 `data-src` 를 `src` 로 옮겨 다운로드를 시작합니다.',
        '`unobserve` 를 호출해 각 이미지는 한 번만 로드됩니다.',
        '`rootMargin` 으로 살짝 미리 로드해 깜빡임을 줄입니다.',
      ],
    },
    sandbox: { title: '코드 샌드박스', hint: 'Ctrl + Enter 실행', clearOutput: '출력 지우기', outputLabel: '// 출력' },
  },
}

export function getUiStrings(locale: Locale): UiStrings {
  const override = OVERRIDES[locale]
  const jsOverride = JS_OVERRIDES[locale]
  return {
    nav: { ...en.nav, ...(override?.nav ?? {}) },
    theme: { ...en.theme, ...(override?.theme ?? {}) },
    pages: { ...en.pages, ...(override?.pages ?? {}) },
    common: { ...en.common, ...(override?.common ?? {}) },
    questions: { ...en.questions, ...(override?.questions ?? {}) },
    js: {
      common: { ...en.js.common, ...(jsOverride?.common ?? {}) },
      debounce: { ...en.js.debounce, ...(jsOverride?.debounce ?? {}) } as UiStrings['js']['debounce'],
      memoize: { ...en.js.memoize, ...(jsOverride?.memoize ?? {}) } as UiStrings['js']['memoize'],
      throttle: { ...en.js.throttle, ...(jsOverride?.throttle ?? {}) } as UiStrings['js']['throttle'],
      lazy: { ...en.js.lazy, ...(jsOverride?.lazy ?? {}) } as UiStrings['js']['lazy'],
      sandbox: { ...en.js.sandbox, ...(jsOverride?.sandbox ?? {}) },
    },
    mockInterview: { ...en.mockInterview, ...(override?.mockInterview ?? {}) },
  }
}

