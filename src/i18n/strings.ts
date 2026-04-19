import type { Page } from '../page'
import type { Locale } from './locale'

export type HomeStrings = {
  metaTitle: string
  heroTitle: string
  heroLead: string
  /** Short hero chip above the title; omit in a locale to hide */
  heroKicker?: string
  sectionAbout: string
  aboutBody: string
  sectionHow: string
  langLabel: string
  cards: {
    js: { title: string; body: string }
    react: { title: string; body: string }
    sandbox: { title: string; body: string }
    mock: { title: string; body: string }
    questions: { title: string; body: string }
    cv: { title: string; body: string }
  }
  cta: string
}

export type CvPageStrings = {
  title: string
  lead: string
  sectionHeading: string
  cvLabel: string
  cvPlaceholder: string
  /** Read-only pane showing the same text as the editor (extracted or pasted). */
  cvPreviewHeading: string
  cvPreviewPlaceholder: string
  /** Alt text for first-page PDF raster preview */
  cvPreviewImageAlt: string
  /** Alt text for canvas raster of pasted / Word-extracted text */
  cvPreviewTextImageAlt: string
  /** Alt text for uploaded PNG/JPEG/WebP/GIF preview */
  cvPreviewUploadImageAlt: string
  /** Shown when an image file is loaded but the CV text field is still empty */
  cvImageNeedTextHint: string
  jobLabel: string
  jobPlaceholder: string
  jobHelp: string
  analyze: string
  analyzing: string
  resultTitle: string
  privacyNote: string
  reset: string
  assistantLabel: string
  apiKeyHint: string
  uploadLabel: string
  uploadHint: string
  uploadButton: string
  uploadParsing: string
  uploadEmpty: string
  uploadUnsupported: string
  uploadTooLarge: string
  uploadReadError: string
  dropZoneHint: string
  dropZoneActive: string
  scoreHeading: string
  scoreOutOf: string
  scoreDisclaimer: string
  nextStepsHeading: string
  dimensionsHeading: string
  dimAts: string
  dimFit: string
  dimClarity: string
  catAts: string
  catFit: string
  catContent: string
  catOther: string
  jobUrlLabel: string
  jobUrlPlaceholder: string
  jobUrlOpen: string
  jobUrlInvalid: string
  jobPasteHint: string
  /** User-message section headers sent to the model (match site language). */
  promptSectionCv: string
  promptSectionJobUrl: string
  promptSectionJobText: string
  promptJobUrlNone: string
  promptNoJobPostingText: string
  /** Link copy to the CV theme preview tool (shown on the CV analysis page). */
  themeGeneratorLink: string
  /** Download résumé as Word (.docx) with the site’s default layout (browser-only). */
  downloadStyledDocx: string
  /** Download résumé as PDF with the same parsed layout (browser-only). */
  downloadStyledPdf: string
}

export type CvThemePageStrings = {
  title: string
  lead: string
  sectionHeading: string
  cvLabel: string
  cvPlaceholder: string
  docxExportHint: string
  downloadDocx: string
  docxWorking: string
  downloadPdf: string
  pdfWorking: string
  /** Link label for the static blank Word template in /public. */
  downloadBlankTemplate: string
  themesHeading: string
  previewHeading: string
  previewAlt: string
  previewEmpty: string
  downloadPng: string
  backToAnalysis: string
  presetEditorial: string
  presetNoir: string
  presetOcean: string
  presetParchment: string
  presetMono: string
  presetRose: string
}

/** LLM user-message section labels — one set per UI locale (merged in getStrings). */
export type CvPagePromptSections = Pick<
  CvPageStrings,
  | 'promptSectionCv'
  | 'promptSectionJobUrl'
  | 'promptSectionJobText'
  | 'promptJobUrlNone'
  | 'promptNoJobPostingText'
>

const CV_PAGE_PROMPT_BY_LOCALE: Record<Locale, CvPagePromptSections> = {
  en: {
    promptSectionCv: '--- CV / résumé ---',
    promptSectionJobUrl: '--- Job posting URL ---',
    promptSectionJobText: '--- Target role or job posting text ---',
    promptJobUrlNone: '(none)',
    promptNoJobPostingText:
      '(No job posting text provided — give general job-search feedback; for CV_DIMENSIONS "fit", estimate general role/market alignment from the CV alone.)',
  },
  he: {
    promptSectionCv: '--- קורות חיים ---',
    promptSectionJobUrl: '--- קישור למשרה ---',
    promptSectionJobText: '--- תפקיד יעד או טקסט מודעת משרה ---',
    promptJobUrlNone: '(אין)',
    promptNoJobPostingText:
      '(לא סופק טקסט מודעת משרה — תנו משוב כללי לחיפוש עבודה; בשדה "fit" ב-CV_DIMENSIONS העריכו התאמה כללית לשוק/תפקיד מתוך קורות החיים בלבד.)',
  },
  es: {
    promptSectionCv: '--- CV / currículum ---',
    promptSectionJobUrl: '--- URL de la oferta ---',
    promptSectionJobText: '--- Puesto objetivo o texto de la oferta ---',
    promptJobUrlNone: '(ninguna)',
    promptNoJobPostingText:
      '(Sin texto de oferta — retroalimentación general; en CV_DIMENSIONS "fit" estime la alineación con el mercado solo a partir del CV.)',
  },
  fr: {
    promptSectionCv: '--- CV ---',
    promptSectionJobUrl: '--- URL de l’offre ---',
    promptSectionJobText: '--- Poste visé ou texte de l’offre ---',
    promptJobUrlNone: '(aucune)',
    promptNoJobPostingText:
      '(Aucun texte d’offre — retour général sur la recherche ; pour CV_DIMENSIONS "fit", estimez l’adéquation marché/rôle à partir du CV seul.)',
  },
  de: {
    promptSectionCv: '--- Lebenslauf / CV ---',
    promptSectionJobUrl: '--- Stellenanzeigen-URL ---',
    promptSectionJobText: '--- Zielrolle oder Anzeigentext ---',
    promptJobUrlNone: '(keine)',
    promptNoJobPostingText:
      '(Kein Anzeigentext — allgemeines Feedback zur Jobsuche; bei CV_DIMENSIONS "fit" allgemeine Rollen-/Marktpassung allein aus dem CV schätzen.)',
  },
  pt: {
    promptSectionCv: '--- CV / currículo ---',
    promptSectionJobUrl: '--- URL da vaga ---',
    promptSectionJobText: '--- Cargo alvo ou texto da vaga ---',
    promptJobUrlNone: '(nenhuma)',
    promptNoJobPostingText:
      '(Sem texto da vaga — feedback geral; em CV_DIMENSIONS "fit", estime o alinhamento com mercado/cargo só com o CV.)',
  },
  ja: {
    promptSectionCv: '--- 履歴書・職務経歴書 ---',
    promptSectionJobUrl: '--- 求人情報URL ---',
    promptSectionJobText: '--- 希望職種または求人本文 ---',
    promptJobUrlNone: '（なし）',
    promptNoJobPostingText:
      '（求人本文なし — 一般的な転職アドバイスを。CV_DIMENSIONS の "fit" は履歴書のみから市場・職種適合を推定。）',
  },
  zh: {
    promptSectionCv: '--- 简历 / 履历 ---',
    promptSectionJobUrl: '--- 职位链接 ---',
    promptSectionJobText: '--- 目标职位或职位描述正文 ---',
    promptJobUrlNone: '（无）',
    promptNoJobPostingText:
      '（未提供职位描述正文 — 请给出通用求职反馈；CV_DIMENSIONS 的 "fit" 请仅根据简历估计与市场/岗位的匹配度。）',
  },
  ar: {
    promptSectionCv: '--- السيرة الذاتية ---',
    promptSectionJobUrl: '--- رابط الوظيفة ---',
    promptSectionJobText: '--- الدور المستهدف أو نص الإعلان ---',
    promptJobUrlNone: '(لا يوجد)',
    promptNoJobPostingText:
      '(لم يُقدَّم نص الإعلان — أعطِ ملاحظات عامة عن البحث عن عمل؛ في CV_DIMENSIONS "fit" قدِّر الانطباع العام عن السوق/الدور من السيرة وحدها.)',
  },
  ru: {
    promptSectionCv: '--- Резюме / CV ---',
    promptSectionJobUrl: '--- Ссылка на вакансию ---',
    promptSectionJobText: '--- Целевая роль или текст вакансии ---',
    promptJobUrlNone: '(нет)',
    promptNoJobPostingText:
      '(Текст вакансии не дан — дайте общий совет по поиску работы; для CV_DIMENSIONS "fit" оцените соответствие рынку/роли только по резюме.)',
  },
  hi: {
    promptSectionCv: '--- बायोडाटा / रिज़्यूमे ---',
    promptSectionJobUrl: '--- नौकरी का लिंक ---',
    promptSectionJobText: '--- लक्ष्य पद या नौकरी विवरण ---',
    promptJobUrlNone: '(कोई नहीं)',
    promptNoJobPostingText:
      '(नौकरी विवरण नहीं — सामान्य जॉब सर्च फीडबैक दें; CV_DIMENSIONS "fit" में केवल रिज़्यूमे से बाज़ार/भूमिका संरेखण अनुमानित करें।)',
  },
  pl: {
    promptSectionCv: '--- CV / życiorys ---',
    promptSectionJobUrl: '--- Link do ogłoszenia ---',
    promptSectionJobText: '--- Docelowa rola lub treść ogłoszenia ---',
    promptJobUrlNone: '(brak)',
    promptNoJobPostingText:
      '(Brak treści ogłoszenia — ogólny feedback; w CV_DIMENSIONS "fit" oceń dopasowanie do rynku/roli tylko z CV.)',
  },
  ko: {
    promptSectionCv: '--- 이력서 / 경력기술서 ---',
    promptSectionJobUrl: '--- 채용 공고 URL ---',
    promptSectionJobText: '--- 지원 직무 또는 공고 본문 ---',
    promptJobUrlNone: '(없음)',
    promptNoJobPostingText:
      '(공고 본문 없음 — 일반 구직 피드백 제공; CV_DIMENSIONS "fit"은 이력서만으로 시장/직무 적합도를 추정.)',
  },
}

export type AppStrings = {
  nav: Record<Page, string>
  home: HomeStrings
  cvPage: CvPageStrings
  cvThemePage: CvThemePageStrings
  /** Text before the linked author name in the footer; omit per-locale to fall back to English. */
  siteCreditPrefix?: string
  /** Linked author display name; omit per-locale to fall back to English. */
  siteCreditName?: string
}

const CV_PAGE_EN: CvPageStrings = {
  title: 'CV analysis for job search',
  lead:
    'Paste your résumé or CV text below, or upload a PDF or Word (.docx) file — text is extracted in your browser. Optionally add a target role or job posting for tailored feedback. Text is sent only to the AI provider you select in settings and is not stored on this site.',
  sectionHeading: 'Your CV and optional job context',
  cvLabel: 'CV / résumé text',
  cvPlaceholder: 'Paste the full text of your CV here…',
  cvPreviewHeading: 'Preview',
  cvPreviewPlaceholder: 'Text you paste or extract from a file will show here as plain text.',
  cvPreviewImageAlt: 'First page of uploaded PDF (visual preview)',
  cvPreviewTextImageAlt: 'CV text rendered as a page preview',
  cvPreviewUploadImageAlt: 'Uploaded CV image preview',
  cvImageNeedTextHint:
    'Photos are shown as a preview only. Paste or type the CV text on the left (or upload PDF/Word) so analysis can run — this page does not OCR images automatically.',
  jobLabel: 'Target role or job description (optional)',
  jobPlaceholder: 'e.g. “Senior frontend engineer” or paste a job posting…',
  jobHelp: 'When provided, the analysis emphasizes fit, gaps, and keywords for that role.',
  analyze: 'Analyze CV',
  analyzing: 'Analyzing…',
  resultTitle: 'Analysis',
  privacyNote:
    'Tip: Remove sensitive details you do not want processed (phone, full address) before pasting. This tool offers guidance only and does not guarantee hiring outcomes.',
  reset: 'Clear inputs',
  assistantLabel: 'Assistant',
  apiKeyHint: 'Add an API key in the AI settings above to run analysis.',
  uploadLabel: 'Upload PDF or Word',
  uploadHint:
    'PDF, Word .docx, or image (PNG, JPEG, WebP, GIF). Text is extracted locally for PDF/Word; images show a preview only until you paste text. Nothing is sent until you run analysis.',
  uploadButton: 'Choose file',
  uploadParsing: 'Reading file…',
  uploadEmpty: 'No text could be extracted. Try another export or paste the text manually.',
  uploadUnsupported:
    'Use PDF, Word .docx, or a raster image (PNG, JPEG, WebP, GIF). Older .doc files are not supported in the browser.',
  uploadTooLarge: 'File is too large (max 12 MB).',
  uploadReadError: 'Could not read this file.',
  dropZoneHint: 'Drag and drop a PDF, .docx, or image file here',
  dropZoneActive: 'Release to load',
  scoreHeading: 'Overall score',
  scoreOutOf: '/100',
  scoreDisclaimer: 'Indicative only — not an employer or ATS verdict.',
  nextStepsHeading: 'Your next steps',
  dimensionsHeading: 'Score breakdown',
  dimAts: 'ATS & keywords',
  dimFit: 'Job fit',
  dimClarity: 'Clarity & impact',
  catAts: 'ATS',
  catFit: 'Fit',
  catContent: 'Content',
  catOther: 'Other',
  jobUrlLabel: 'Job posting link (optional)',
  jobUrlPlaceholder: 'https://…',
  jobUrlOpen: 'Open link',
  jobUrlInvalid: 'Enter a valid http(s) URL or leave this field empty.',
  jobPasteHint:
    'This app cannot load most job sites in the browser. Open the link in another tab, copy the posting text, and paste it below for a role-specific comparison.',
  themeGeneratorLink: 'Try CV theme preview — colors & fonts as a shareable image',
  downloadStyledDocx: 'Download résumé (.docx — styled layout)',
  downloadStyledPdf: 'Download résumé (.pdf — styled layout)',
  ...CV_PAGE_PROMPT_BY_LOCALE.en,
}

const CV_PAGE_HE: CvPageStrings = {
  title: 'ניתוח קורות חיים לחיפוש עבודה',
  lead:
    'הדביקו למטה את טקסט קורות החיים או העלו קובץ PDF או Word (.docx) — הטקסט נחלץ בדפדפן. אפשר להוסיף תפקיד יעד או מודעת משרה למשוב ממוקד. הטקסט נשלח רק לספק ה-AI שבחרתם בהגדרות ואינו נשמר באתר.',
  sectionHeading: 'קורות החיים והקשר למשרה (אופציונלי)',
  cvLabel: 'טקסט קורות חיים / קורות חיים',
  cvPlaceholder: 'הדביקו כאן את מלוא קורות החיים…',
  cvPreviewHeading: 'תצוגה מקדימה',
  cvPreviewPlaceholder: 'טקסט שתדביקו או שיימשך מהקובץ יוצג כאן כטקסט פשוט.',
  cvPreviewImageAlt: 'עמוד ראשון של קובץ PDF שהועלה (תצוגה ויזואלית)',
  cvPreviewTextImageAlt: 'תצוגת עמוד של טקסט קורות החיים',
  cvPreviewUploadImageAlt: 'תצוגה מקדימה של תמונת קורות חיים שהועלתה',
  cvImageNeedTextHint:
    'תמונות מוצגות לתצוגה בלבד. הדביקו או הקלידו את טקסט קורות החיים משמאל (או העלו PDF/Word) כדי להריץ ניתוח — הדף אינו מבצע OCR אוטומטי לתמונות.',
  jobLabel: 'תפקיד יעד או תיאור משרה (אופציונלי)',
  jobPlaceholder: 'למשל "מפתח פרונטנד בכיר" או הדבקת מודעת משרה…',
  jobHelp: 'כשממלאים, הניתוח מתמקד בהתאמה, פערים ומילות מפתח לתפקיד.',
  analyze: 'נתח קורות חיים',
  analyzing: 'מנתח…',
  resultTitle: 'ניתוח',
  privacyNote:
    'טיפ: הסירו פרטים רגישים שאינכם רוצים לעבד (טלפון, כתובת מלאה) לפני ההדבקה. הכלי מספק הנחיה בלבד ואינו מבטיח תוצאות בגיוס.',
  reset: 'נקה שדות',
  assistantLabel: 'עוזר',
  apiKeyHint: 'הוסיפו מפתח API בהגדרות הבינה המלאכותית למעלה כדי להריץ ניתוח.',
  uploadLabel: 'העלאת PDF או Word',
  uploadHint:
    'PDF, Word ‎.docx או תמונה (PNG, JPEG, WebP, GIF). טקסט נחלץ מקומית מ-PDF/Word; תמונות מוצגות בתצוגה בלבד עד שמדביקים טקסט. שום דבר לא נשלח עד שמריצים ניתוח.',
  uploadButton: 'בחירת קובץ',
  uploadParsing: 'קורא קובץ…',
  uploadEmpty: 'לא ניתן היה לחלץ טקסט. נסו ייצוא אחר או הדביקו את הטקסט ידנית.',
  uploadUnsupported:
    'השתמשו ב-PDF, Word ‎.docx או תמונת רסטר (PNG, JPEG, WebP, GIF). קבצי ‎.doc ישנים אינם נתמכים בדפדפן.',
  uploadTooLarge: 'הקובץ גדול מדי (מקסימום 12 מ״ב).',
  uploadReadError: 'לא ניתן לקרוא את הקובץ.',
  dropZoneHint: 'גררו לכאן קובץ PDF, ‎.docx או תמונה',
  dropZoneActive: 'שחררו לטעינה',
  scoreHeading: 'ציון כולל',
  scoreOutOf: '/100',
  scoreDisclaimer: 'להמחשה בלבד — לא ציון מטעם מעסיק או ממערכת ATS.',
  nextStepsHeading: 'הצעדים הבאים שלכם',
  dimensionsHeading: 'פירוט ציונים',
  dimAts: 'ATS ומילות מפתח',
  dimFit: 'התאמה למשרה',
  dimClarity: 'בהירות והשפעה',
  catAts: 'ATS',
  catFit: 'התאמה',
  catContent: 'תוכן',
  catOther: 'אחר',
  jobUrlLabel: 'קישור למשרה (אופציונלי)',
  jobUrlPlaceholder: 'https://…',
  jobUrlOpen: 'פתיחת הקישור',
  jobUrlInvalid: 'הזינו כתובת http(s) תקינה או השאירו ריק.',
  jobPasteHint:
    'האפליקציה אינה יכולה לטעון את רוב אתרי הגיוס בדפדפן. פתחו את הקישור בלשונית אחרת, העתיקו את טקסט המשרה והדביקו למטה להשוואה ממוקדת.',
  themeGeneratorLink: 'תצוגת ערכות צבע וגופנים לקורות חיים (תמונה)',
  downloadStyledDocx: 'הורדת קו״ח (.docx — פריסה מעוצבת)',
  downloadStyledPdf: 'הורדת קו״ח ‎(.pdf — פריסה מעוצבת)',
  ...CV_PAGE_PROMPT_BY_LOCALE.he,
}

const CV_THEME_PAGE_EN: CvThemePageStrings = {
  title: 'CV theme preview',
  lead:
    'Pick a visual preset and paste résumé text. A PNG preview is generated entirely in your browser — no API calls. Use it to compare palettes and type moods before you commit in Word, Figma, or LaTeX.',
  sectionHeading: 'Text and theme',
  cvLabel: 'Plain-text CV',
  cvPlaceholder: 'Paste your CV as plain text…',
  docxExportHint:
    'You can also download a Word (.docx) or PDF that uses the same typography and colors as the reference résumé layout (Arial + Courier, blue section rules, right-aligned dates). Parsing is best-effort from plain text — use clear section headings such as SKILLS, WORK HISTORY, and EDUCATION.',
  downloadDocx: 'Download Word (.docx)',
  docxWorking: 'Preparing…',
  downloadPdf: 'Download PDF',
  pdfWorking: 'Preparing…',
  downloadBlankTemplate: 'Download blank Word template (.docx)',
  themesHeading: 'Theme presets',
  previewHeading: 'Preview',
  previewAlt: 'CV plain text rendered with the selected theme',
  previewEmpty: 'Add some text to see a preview.',
  downloadPng: 'Download PNG',
  backToAnalysis: '← CV analysis (feedback with AI)',
  presetEditorial: 'Editorial',
  presetNoir: 'Noir',
  presetOcean: 'Ocean serif',
  presetParchment: 'Parchment',
  presetMono: 'Mono',
  presetRose: 'Rose',
}

const CV_THEME_PAGE_HE: CvThemePageStrings = {
  ...CV_THEME_PAGE_EN,
  title: 'תצוגת ערכת עיצוב לקורות חיים',
  lead:
    'בחרו ערכת צבעים והדביקו טקסט קורות חיים. תמונת PNG נוצרת בדפדפן בלבד — בלי קריאות ל-API. מתאים להשוואת מצב רוח טיפוגרפי לפני עיצוב ב-Word, Figma או LaTeX.',
  sectionHeading: 'טקסט וערכת נושא',
  cvLabel: 'קורות חיים כטקסט פשוט',
  cvPlaceholder: 'הדביקו כאן את קורות החיים כטקסט פשוט…',
  docxExportHint:
    'אפשר גם להוריד קובץ Word ‎(.docx) או PDF עם אותה שפת עיצוב כמו בפריסת הייחוס (Arial + Courier, קווים כחולים, תאריכים מיושרים לימין). הניתוח הוא הטבה מטקסט פשוט — עדיף כותרות מקטעים ברורות כמו SKILLS, WORK HISTORY, EDUCATION.',
  downloadDocx: 'הורדת Word ‎(.docx)',
  docxWorking: 'מכין…',
  downloadPdf: 'הורדת PDF',
  pdfWorking: 'מכין…',
  downloadBlankTemplate: 'הורדת תבנית Word ריקה ‎(.docx)',
  themesHeading: 'ערכות מוכנות',
  previewHeading: 'תצוגה מקדימה',
  previewAlt: 'טקסט קורות חיים מוצג עם הערכה שנבחרה',
  previewEmpty: 'הוסיפו טקסט כדי לראות תצוגה מקדימה.',
  downloadPng: 'הורדת PNG',
  backToAnalysis: '← ניתוח קורות חיים (משוב עם בינה מלאכותית)',
  presetEditorial: 'עריכתי',
  presetNoir: 'נואר',
  presetOcean: 'מפרץ (סריף)',
  presetParchment: 'קלף',
  presetMono: 'מונו',
  presetRose: 'ורוד',
}

const en: AppStrings = {
  siteCreditPrefix: 'Created by ',
  siteCreditName: 'Yaron Kinar',
  nav: {
    home: 'Home',
    js: 'JS Patterns',
    react: 'React Questions',
    css: 'CSS',
    sandbox: 'React sandbox',
    mock: 'Mock interview',
    questions: 'Company Q&A',
    cv: 'CV analysis',
    cvThemes: 'CV themes',
  },
  home: {
    metaTitle: 'Interview Prep — practice in the browser',
    heroTitle: 'Interview Prep',
    heroLead:
      'Practice JavaScript patterns, React concepts, company-style questions, and AI mock interviews — all in your browser.',
    heroKicker: 'Browser-based interview practice',
    sectionAbout: 'What this site is',
    aboutBody:
      'This is a focused training ground for technical interviews. You can read and run interactive examples, try coding exercises in a sandbox, review company-specific Q&A, and run a voice-friendly mock interview powered by Claude when you add your API key.',
    sectionHow: 'How to use each area',
    langLabel: 'Language',
    cards: {
      js: {
        title: 'JS Patterns',
        body: 'Explore classic patterns (debounce, memoize, iterators, and more) with runnable demos and short explanations.',
      },
      react: {
        title: 'React Questions',
        body: 'Walk through hooks and React interview topics with live examples you can inspect and tweak.',
      },
      sandbox: {
        title: 'React sandbox',
        body: 'Experiment with React in an isolated editor and preview — useful for quick prototypes and interview-style components.',
      },
      mock: {
        title: 'Mock interview',
        body: 'Configure your Anthropic API key in settings, then practice a timed mock interview with speech and an in-browser code editor.',
      },
      questions: {
        title: 'Company Q&A',
        body: 'Browse categorized questions and answers tailored for company-style interviews.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'Choose a section from the navigation above to get started.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const he: AppStrings = {
  siteCreditPrefix: 'נוצר על ידי ',
  siteCreditName: 'ירון קינר',
  nav: {
    home: 'בית',
    js: 'דפוסי JS',
    react: 'שאלות React',
    css: 'CSS',
    sandbox: 'ארגז חול React',
    mock: 'ראיון דמה',
    questions: 'שאלות ותשובות',
    cv: 'ניתוח קורות חיים',
    cvThemes: 'ערכות קו״ח',
  },
  home: {
    metaTitle: 'הכנה לראיונות — תרגול בדפדפן',
    heroTitle: 'הכנה לראיונות',
    heroLead:
      'תרגל דפוסי JavaScript, מושגי React, שאלות בסגנון חברות וראיונות דמה עם בינה מלאכותית — הכול בדפדפן.',
    sectionAbout: 'מה האתר הזה',
    aboutBody:
      'זהו מגרש אימונים ממוקד לראיונות טכניים. אפשר לקרוא ולהריץ דוגמאות אינטראקטיביות, לנסות תרגילים בארגז חול, לעבור שאלות ותשובות בסגנון חברות, ולבצע ראיון דמה קולי עם Claude לאחר הוספת מפתח API.',
    sectionHow: 'איך להשתמש בכל אזור',
    langLabel: 'שפה',
    cards: {
      js: {
        title: 'דפוסי JS',
        body: 'גלו דפוסים קלאסיים (debounce, memoize, איטרטורים ועוד) עם הדגמות והסברים קצרים.',
      },
      react: {
        title: 'שאלות React',
        body: 'עברו על hooks ונושאי React עם דוגמאות חיות שניתן לבחון ולשנות.',
      },
      sandbox: {
        title: 'ארגז חול React',
        body: 'התנסו ב-React בעורך ובתצוגה מקדימה — מתאים לרכיבים בסגנון ראיון.',
      },
      mock: {
        title: 'ראיון דמה',
        body: 'הגדירו מפתח Anthropic בהגדרות, ואז תרגלו ראיון מתוזמן עם דיבור ועורך קוד בדפדפן.',
      },
      questions: {
        title: 'שאלות ותשובות',
        body: 'עיינו בשאלות ותשובות מסווגות לראיונות בסגנון חברות.',
      },
      cv: {
        title: 'ניתוח קורות חיים',
        body: 'הדביקו את קורות החיים, אפשר להוסיף משרה יעד, וקבלו משוב מובנה לחיפוש העבודה עם ספק ה-AI שבחרתם.',
      },
    },
    cta: 'בחרו אזור מהתפריט למעלה כדי להתחיל.',
  },
  cvPage: CV_PAGE_HE,
  cvThemePage: CV_THEME_PAGE_HE,
}

const es: AppStrings = {
  nav: {
    home: 'Inicio',
    js: 'Patrones JS',
    react: 'Preguntas React',
    css: 'CSS',
    sandbox: 'Sandbox React',
    mock: 'Simulacro',
    questions: 'P&R empresas',
    cv: 'Análisis de CV',
    cvThemes: 'Temas CV',
  },
  home: {
    metaTitle: 'Preparación para entrevistas — práctica en el navegador',
    heroTitle: 'Preparación para entrevistas',
    heroLead:
      'Practica patrones de JavaScript, conceptos de React, preguntas tipo empresa y simulacros con IA — todo en el navegador.',
    sectionAbout: 'Qué es este sitio',
    aboutBody:
      'Es un espacio de entrenamiento para entrevistas técnicas. Puedes leer y ejecutar ejemplos interactivos, resolver ejercicios en un sandbox, repasar preguntas y respuestas tipo empresa, y hacer un simulacro por voz con Claude si añades tu clave API.',
    sectionHow: 'Cómo usar cada sección',
    langLabel: 'Idioma',
    cards: {
      js: {
        title: 'Patrones JS',
        body: 'Explora patrones clásicos (debounce, memoize, iteradores y más) con demos y explicaciones breves.',
      },
      react: {
        title: 'Preguntas React',
        body: 'Repasa hooks y temas de React con ejemplos en vivo que puedes inspeccionar y modificar.',
      },
      sandbox: {
        title: 'Sandbox React',
        body: 'Experimenta con React en un editor y vista previa — útil para prototipos y componentes tipo entrevista.',
      },
      mock: {
        title: 'Simulacro',
        body: 'Configura tu clave API de Anthropic en ajustes y practica un simulacro cronometrado con voz y editor en el navegador.',
      },
      questions: {
        title: 'P&R empresas',
        body: 'Navega preguntas y respuestas categorizadas para entrevistas tipo empresa.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'Elige una sección en la barra superior para empezar.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const fr: AppStrings = {
  nav: {
    home: 'Accueil',
    js: 'Patterns JS',
    react: 'Questions React',
    css: 'CSS',
    sandbox: 'Bac à sable React',
    mock: 'Entretien blanc',
    questions: 'Q&R entreprises',
    cv: 'Analyse CV',
    cvThemes: 'Thèmes CV',
  },
  home: {
    metaTitle: 'Préparation entretiens — pratique dans le navigateur',
    heroTitle: 'Préparation entretiens',
    heroLead:
      'Entraînez-vous aux patterns JavaScript, aux concepts React, aux questions type entreprise et aux entretiens blancs IA — tout dans le navigateur.',
    sectionAbout: 'À propos de ce site',
    aboutBody:
      'C’est un terrain d’entraînement pour entretiens techniques. Vous pouvez lire et exécuter des exemples interactifs, faire des exercices dans un bac à sable, réviser des Q&R type entreprise, et passer un entretien blanc vocal avec Claude après avoir ajouté votre clé API.',
    sectionHow: 'Comment utiliser chaque zone',
    langLabel: 'Langue',
    cards: {
      js: {
        title: 'Patterns JS',
        body: 'Explorez des patterns classiques (debounce, memoize, itérateurs, etc.) avec des démos et des explications courtes.',
      },
      react: {
        title: 'Questions React',
        body: 'Révisez les hooks et sujets React avec des exemples vivants que vous pouvez inspecter et modifier.',
      },
      sandbox: {
        title: 'Bac à sable React',
        body: 'Expérimentez React dans un éditeur et aperçu — utile pour prototypes et composants type entretien.',
      },
      mock: {
        title: 'Entretien blanc',
        body: 'Configurez votre clé API Anthropic dans les paramètres, puis entraînez-vous avec chronomètre, voix et éditeur dans le navigateur.',
      },
      questions: {
        title: 'Q&R entreprises',
        body: 'Parcourez des questions et réponses classées pour entretiens type entreprise.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'Choisissez une section dans la barre du haut pour commencer.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const de: AppStrings = {
  nav: {
    home: 'Start',
    js: 'JS-Muster',
    react: 'React-Fragen',
    css: 'CSS',
    sandbox: 'React-Sandbox',
    mock: 'Probegespräch',
    questions: 'Firmen-F&A',
    cv: 'Lebenslauf-Analyse',
    cvThemes: 'CV-Themes',
  },
  home: {
    metaTitle: 'Interview Prep — Übung im Browser',
    heroTitle: 'Interview Prep',
    heroLead:
      'Übe JavaScript-Muster, React-Konzepte, firmenähnliche Fragen und KI-Probegespräche — alles im Browser.',
    sectionAbout: 'Worum es geht',
    aboutBody:
      'Dies ist ein Trainingsbereich für technische Interviews. Du kannst interaktive Beispiele lesen und ausführen, Aufgaben in einer Sandbox lösen, Firmen-Q&A wiederholen und ein sprachbasiertes Probegespräch mit Claude führen, sobald du deinen API-Schlüssel hinterlegt hast.',
    sectionHow: 'So nutzt du die Bereiche',
    langLabel: 'Sprache',
    cards: {
      js: {
        title: 'JS-Muster',
        body: 'Klassische Muster (debounce, memoize, Iteratoren u. a.) mit kurzen Demos und Erklärungen.',
      },
      react: {
        title: 'React-Fragen',
        body: 'Hooks und React-Themen mit live Beispielen, die du ansehen und anpassen kannst.',
      },
      sandbox: {
        title: 'React-Sandbox',
        body: 'Experimentiere mit React in Editor und Vorschau — ideal für schnelle Prototypen und Interview-Komponenten.',
      },
      mock: {
        title: 'Probegespräch',
        body: 'Trage deinen Anthropic-API-Schlüssel in den Einstellungen ein und übe ein zeitgesteuertes Gespräch mit Sprache und Editor im Browser.',
      },
      questions: {
        title: 'Firmen-F&A',
        body: 'Durchsuche kategorisierte Fragen und Antworten für firmenähnliche Interviews.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'Wähle oben in der Navigation einen Bereich, um zu starten.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const pt: AppStrings = {
  nav: {
    home: 'Início',
    js: 'Padrões JS',
    react: 'Perguntas React',
    css: 'CSS',
    sandbox: 'Sandbox React',
    mock: 'Simulado',
    questions: 'P&R empresas',
    cv: 'Análise de CV',
    cvThemes: 'Temas CV',
  },
  home: {
    metaTitle: 'Preparação para entrevistas — prática no navegador',
    heroTitle: 'Preparação para entrevistas',
    heroLead:
      'Pratique padrões JavaScript, conceitos React, perguntas estilo empresa e simulados com IA — tudo no navegador.',
    sectionAbout: 'O que é este site',
    aboutBody:
      'É um espaço de treino para entrevistas técnicas. Você pode ler e executar exemplos interativos, fazer exercícios em sandbox, revisar perguntas e respostas estilo empresa e fazer um simulado por voz com Claude após adicionar sua chave de API.',
    sectionHow: 'Como usar cada área',
    langLabel: 'Idioma',
    cards: {
      js: {
        title: 'Padrões JS',
        body: 'Explore padrões clássicos (debounce, memoize, iteradores e mais) com demos e explicações curtas.',
      },
      react: {
        title: 'Perguntas React',
        body: 'Revise hooks e tópicos React com exemplos ao vivo que você pode inspecionar e alterar.',
      },
      sandbox: {
        title: 'Sandbox React',
        body: 'Experimente React em editor e preview — útil para protótipos e componentes estilo entrevista.',
      },
      mock: {
        title: 'Simulado',
        body: 'Configure sua chave API Anthropic nas configurações e pratique um simulado com tempo, voz e editor no navegador.',
      },
      questions: {
        title: 'P&R empresas',
        body: 'Navegue perguntas e respostas categorizadas para entrevistas estilo empresa.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'Escolha uma seção na barra acima para começar.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const ja: AppStrings = {
  nav: {
    home: 'ホーム',
    js: 'JS パターン',
    react: 'React 質問',
    css: 'CSS',
    sandbox: 'React サンドボックス',
    mock: '模擬面接',
    questions: '企業 Q&A',
    cv: '履歴書の分析',
    cvThemes: '履歴書のテーマ',
  },
  home: {
    metaTitle: '面接対策 — ブラウザで練習',
    heroTitle: '面接対策',
    heroLead:
      'JavaScript のパターン、React、企業向けの質問、AI 模擬面接までブラウザで練習できます。',
    sectionAbout: 'このサイトについて',
    aboutBody:
      '技術面接のための学習用サイトです。インタラクティブな例の閲覧・実行、サンドボックスでの演習、企業スタイルの Q&A、API キーを設定したうえでの Claude による音声模擬面接ができます。',
    sectionHow: '各エリアの使い方',
    langLabel: '言語',
    cards: {
      js: {
        title: 'JS パターン',
        body: 'debounce、memoize、イテレータなど古典的なパターンをデモと短い説明で学びます。',
      },
      react: {
        title: 'React 質問',
        body: 'hooks や React のトピックを、動く例を見ながら確認・変更できます。',
      },
      sandbox: {
        title: 'React サンドボックス',
        body: 'エディタとプレビューで React を試せます。面接向けコンポーネントの素早い試作に便利です。',
      },
      mock: {
        title: '模擬面接',
        body: '設定で Anthropic の API キーを入力し、音声とブラウザ内エディタで時間付きの模擬面接を練習します。',
      },
      questions: {
        title: '企業 Q&A',
        body: '企業面接向けに分類された質問と回答を閲覧できます。',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: '上のナビからセクションを選んで始めてください。',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const zh: AppStrings = {
  nav: {
    home: '首页',
    js: 'JS 模式',
    react: 'React 题库',
    css: 'CSS',
    sandbox: 'React 沙箱',
    mock: '模拟面试',
    questions: '公司问答',
    cv: '简历分析',
    cvThemes: '简历主题',
  },
  home: {
    metaTitle: '面试准备 — 在浏览器中练习',
    heroTitle: '面试准备',
    heroLead:
      '在浏览器中练习 JavaScript 模式、React 概念、公司风格问答与 AI 模拟面试。',
    sectionAbout: '本站是什么',
    aboutBody:
      '这是面向技术面试的集中练习环境。你可以阅读并运行交互示例、在沙箱中做题、浏览公司风格问答，并在配置 API 密钥后使用 Claude 进行语音模拟面试。',
    sectionHow: '各区域如何使用',
    langLabel: '语言',
    cards: {
      js: {
        title: 'JS 模式',
        body: '通过可运行示例与简短说明学习经典模式（debounce、memoize、迭代器等）。',
      },
      react: {
        title: 'React 题库',
        body: '通过可运行示例复习 hooks 与 React 主题，便于查看与修改。',
      },
      sandbox: {
        title: 'React 沙箱',
        body: '在编辑器与预览中试验 React，适合快速原型与面试式组件。',
      },
      mock: {
        title: '模拟面试',
        body: '在设置中配置 Anthropic API 密钥后，可练习带计时的语音模拟面试与浏览器内代码编辑。',
      },
      questions: {
        title: '公司问答',
        body: '浏览按类别整理的公司风格面试问答。',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: '请从上方导航选择要开始的区域。',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const ar: AppStrings = {
  nav: {
    home: 'الرئيسية',
    js: 'أنماط JS',
    react: 'أسئلة React',
    css: 'CSS',
    sandbox: 'بيئة React',
    mock: 'مقابلة تجريبية',
    questions: 'أسئلة الشركات',
    cv: 'تحليل السيرة الذاتية',
    cvThemes: 'سمات السيرة',
  },
  home: {
    metaTitle: 'التحضير للمقابلات — تمرّن في المتصفح',
    heroTitle: 'التحضير للمقابلات',
    heroLead:
      'تدرّب على أنماط JavaScript ومفاهيم React وأسئلة على نمط الشركات ومقابلات تجريبية بالذكاء الاصطناعي — كل ذلك في المتصفح.',
    sectionAbout: 'عن هذا الموقع',
    aboutBody:
      'مساحة تدريب مركّزة للمقابلات التقنية. يمكنك قراءة وتشغيل أمثلة تفاعلية، وحل تمارين في بيئة معزولة، ومراجعة أسئلة وأجوبة على نمط الشركات، وإجراء مقابلة تجريبية صوتية مع Claude بعد إضافة مفتاح API.',
    sectionHow: 'كيفية استخدام كل قسم',
    langLabel: 'اللغة',
    cards: {
      js: {
        title: 'أنماط JS',
        body: 'استكشف أنماطاً كلاسيكية (debounce وmemoize والمكررات وغيرها) مع عروض وشرح مختصر.',
      },
      react: {
        title: 'أسئلة React',
        body: 'راجع الـ hooks ومواضيع React بأمثلة حيّة يمكنك فحصها وتعديلها.',
      },
      sandbox: {
        title: 'بيئة React',
        body: 'جرّب React في محرر ومعاينة — مفيد للنماذج السريعة ومكوّنات على نمط المقابلات.',
      },
      mock: {
        title: 'مقابلة تجريبية',
        body: 'اضبط مفتاح Anthropic API في الإعدادات ثم تدرّب على مقابلة بوقت وصوت ومحرر داخل المتصفح.',
      },
      questions: {
        title: 'أسئلة الشركات',
        body: 'تصفّح أسئلة وأجوبة مصنّفة لأسلوب مقابلات الشركات.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'اختر قسماً من شريط التنقل أعلاه للبدء.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const ru: AppStrings = {
  nav: {
    home: 'Главная',
    js: 'Паттерны JS',
    react: 'Вопросы React',
    css: 'CSS',
    sandbox: 'Песочница React',
    mock: 'Пробное интервью',
    questions: 'Вопросы компаний',
    cv: 'Анализ резюме',
    cvThemes: 'Темы резюме',
  },
  home: {
    metaTitle: 'Подготовка к собеседованиям — в браузере',
    heroTitle: 'Подготовка к собеседованиям',
    heroLead:
      'Тренируйте паттерны JavaScript, React, вопросы в стиле компаний и пробные интервью с ИИ — всё в браузере.',
    sectionAbout: 'Что это за сайт',
    aboutBody:
      'Это площадка для подготовки к техническим интервью: интерактивные примеры, задачи в песочнице, Q&A в стиле компаний и голосовое пробное интервью с Claude после добавления API-ключа.',
    sectionHow: 'Как пользоваться разделами',
    langLabel: 'Язык',
    cards: {
      js: {
        title: 'Паттерны JS',
        body: 'Классические паттерны (debounce, memoize, итераторы и др.) с демо и краткими пояснениями.',
      },
      react: {
        title: 'Вопросы React',
        body: 'Hooks и темы React на живых примерах, которые можно смотреть и менять.',
      },
      sandbox: {
        title: 'Песочница React',
        body: 'Эксперименты с React в редакторе и превью — для быстрых прототипов и компонентов «как на собеседовании».',
      },
      mock: {
        title: 'Пробное интервью',
        body: 'Укажите API-ключ Anthropic в настройках и тренируйтесь с таймером, голосом и редактором в браузере.',
      },
      questions: {
        title: 'Вопросы компаний',
        body: 'Категоризированные вопросы и ответы в стиле компаний.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'Выберите раздел в верхней навигации, чтобы начать.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const hi: AppStrings = {
  nav: {
    home: 'होम',
    js: 'JS पैटर्न',
    react: 'React प्रश्न',
    css: 'CSS',
    sandbox: 'React सैंडबॉक्स',
    mock: 'मॉक इंटरव्यू',
    questions: 'कंपनी Q&A',
    cv: 'CV विश्लेषण',
    cvThemes: 'CV थीम',
  },
  home: {
    metaTitle: 'इंटरव्यू तैयारी — ब्राउज़र में अभ्यास',
    heroTitle: 'इंटरव्यू तैयारी',
    heroLead:
      'JavaScript पैटर्न, React अवधारणाएँ, कंपनी-शैली प्रश्न और AI मॉक इंटरव्यू — सब ब्राउज़र में।',
    sectionAbout: 'यह साइट क्या है',
    aboutBody:
      'तकनीकी इंटरव्यू के लिए अभ्यास स्थल। आप इंटरैक्टिव उदाहरण चला सकते हैं, सैंडबॉक्स में अभ्यास कर सकते हैं, कंपनी-शैली Q&A देख सकते हैं, और API कुंजी जोड़ने के बाद Claude के साथ आवाज़ वाला मॉक इंटरव्यू कर सकते हैं।',
    sectionHow: 'हर हिस्से का उपयोग कैसे करें',
    langLabel: 'भाषा',
    cards: {
      js: {
        title: 'JS पैटर्न',
        body: 'debounce, memoize, इटरेटर आदि क्लासिक पैटर्न डेमो और संक्षिप्त व्याख्या के साथ।',
      },
      react: {
        title: 'React प्रश्न',
        body: 'hooks और React विषयों को लाइव उदाहरणों के साथ देखें और बदलें।',
      },
      sandbox: {
        title: 'React सैंडबॉक्स',
        body: 'एडिटर और प्रीव्यू में React आज़माएँ — त्वरित प्रोटोटाइप और इंटरव्यू-जैसे कंपोनेंट के लिए।',
      },
      mock: {
        title: 'मॉक इंटरव्यू',
        body: 'सेटिंग्स में Anthropic API कुंजी सेट करें, फिर समय, आवाज़ और ब्राउज़र एडिटर के साथ अभ्यास करें।',
      },
      questions: {
        title: 'कंपनी Q&A',
        body: 'कंपनी-शैली इंटरव्यू के लिए वर्गीकृत प्रश्न और उत्तर।',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'शुरू करने के लिए ऊपर नेविगेशन से एक खंड चुनें।',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const pl: AppStrings = {
  nav: {
    home: 'Start',
    js: 'Wzorce JS',
    react: 'Pytania React',
    css: 'CSS',
    sandbox: 'Piaskownica React',
    mock: 'Mock interview',
    questions: 'Pytania firm',
    cv: 'Analiza CV',
    cvThemes: 'Motywy CV',
  },
  home: {
    metaTitle: 'Przygotowanie do rozmów — w przeglądarce',
    heroTitle: 'Przygotowanie do rozmów',
    heroLead:
      'Ćwicz wzorce JavaScript, React, pytania w stylu firm i mockowe rozmowy z AI — wszystko w przeglądarce.',
    sectionAbout: 'Czym jest ta strona',
    aboutBody:
      'To miejsce do treningu pod rozmowy techniczne: interaktywne przykłady, zadania w piaskownicy, Q&A w stylu firm oraz głosowy mock z Claude po dodaniu klucza API.',
    sectionHow: 'Jak korzystać z sekcji',
    langLabel: 'Język',
    cards: {
      js: {
        title: 'Wzorce JS',
        body: 'Klasyczne wzorce (debounce, memoize, iteratory itd.) z krótkimi demo i wyjaśnieniami.',
      },
      react: {
        title: 'Pytania React',
        body: 'Hooki i tematy React na żywych przykładach do podglądu i edycji.',
      },
      sandbox: {
        title: 'Piaskownica React',
        body: 'Eksperymentuj z React w edytorze i podglądzie — do szybkich prototypów i komponentów jak na rozmowie.',
      },
      mock: {
        title: 'Mock interview',
        body: 'Ustaw klucz API Anthropic w ustawieniach i ćwicz z czasem, głosem i edytorem w przeglądarce.',
      },
      questions: {
        title: 'Pytania firm',
        body: 'Przeglądaj pytania i odpowiedzi pogrupowane pod rozmowy w stylu firm.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: 'Wybierz sekcję w górnym menu, aby zacząć.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

const ko: AppStrings = {
  nav: {
    home: '홈',
    js: 'JS 패턴',
    react: 'React 질문',
    css: 'CSS',
    sandbox: 'React 샌드박스',
    mock: '모의 면접',
    questions: '기업 Q&A',
    cv: '이력서 분석',
    cvThemes: '이력서 테마',
  },
  home: {
    metaTitle: '면접 준비 — 브라우저에서 연습',
    heroTitle: '면접 준비',
    heroLead:
      'JavaScript 패턴, React 개념, 기업 스타일 질문, AI 모의 면접까지 브라우저에서 연습하세요.',
    sectionAbout: '이 사이트 소개',
    aboutBody:
      '기술 면접을 위한 연습 공간입니다. 인터랙티브 예제 실행, 샌드박스 문제 풀이, 기업 스타일 Q&A, API 키를 설정한 뒤 Claude와 음성 모의 면접을 진행할 수 있습니다.',
    sectionHow: '각 영역 사용 방법',
    langLabel: '언어',
    cards: {
      js: {
        title: 'JS 패턴',
        body: 'debounce, memoize, 이터레이터 등 고전 패턴을 데모와 짧은 설명으로 익힙니다.',
      },
      react: {
        title: 'React 질문',
        body: 'hooks와 React 주제를 살아 있는 예제로 확인하고 수정합니다.',
      },
      sandbox: {
        title: 'React 샌드박스',
        body: '에디터와 미리보기에서 React를 실험합니다. 빠른 프로토타입과 면접형 컴포넌트에 적합합니다.',
      },
      mock: {
        title: '모의 면접',
        body: '설정에서 Anthropic API 키를 입력한 뒤, 음성과 브라우저 편집기로 시간 제한 모의 면접을 연습합니다.',
      },
      questions: {
        title: '기업 Q&A',
        body: '기업 면접 스타일로 분류된 질문과 답을 둘러봅니다.',
      },
      cv: {
        title: 'CV analysis',
        body: 'Paste your résumé, optionally add a target job, and get structured feedback for your search using your chosen AI provider.',
      },
    },
    cta: '위에서 시작할 섹션을 선택하세요.',
  },
  cvPage: CV_PAGE_EN,
  cvThemePage: CV_THEME_PAGE_EN,
}

export const STRINGS_BY_LOCALE: Record<Locale, AppStrings> = {
  en,
  he,
  es,
  fr,
  de,
  pt,
  ja,
  zh,
  ar,
  ru,
  hi,
  pl,
  ko,
}

export function getStrings(locale: Locale): AppStrings {
  const s = STRINGS_BY_LOCALE[locale] ?? en
  return {
    ...s,
    siteCreditPrefix: s.siteCreditPrefix ?? en.siteCreditPrefix,
    siteCreditName: s.siteCreditName ?? en.siteCreditName,
    cvPage: { ...s.cvPage, ...CV_PAGE_PROMPT_BY_LOCALE[locale] },
  }
}
