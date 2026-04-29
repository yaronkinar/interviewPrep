/** UI copy for Mock interview page + session (Company Q&A mock trainer). */
export type MockInterviewStrings = {
  pageTitle: string
  pageLead: string
  sidebarBrandTitle: string
  sidebarBrandStatus: string
  navSetup: string
  navLibrary: string
  navAnalytics: string
  navPractice: string
  navSettings: string
  sidebarStartSession: string
  mainPracticeTitle: string
  mainSubtitle: string
  overviewInterviewerLabel: string
  interviewerName: string
  interviewerRole: string
  listeningLeft: string
  listeningRight: string
  overviewSessionContext: string
  overviewTargetRoleLine: string
  overviewFocusPrefix: string
  interviewPracticeFallback: string
  step1Title: string
  step2Title: string
  step3Title: string
  searchPlaceholder: string
  emptyQuestions: string
  questionSelectLabel: string
  solveWhatTests: string
  solveHowToSolve: string
  sessionTimerPrefix: string
  sessionTimerMid: string
  includeRefAnswer: string
  trainUnderstandLabel: string
  trainUnderstandBlurb: string
  trainVerbalLabel: string
  trainVerbalBlurb: string
  trainInterviewerLabel: string
  trainInterviewerBlurb: string
  trainCodeReviewLabel: string
  trainCodeReviewBlurb: string
  difficultyEasy: string
  difficultyMedium: string
  difficultyHard: string
  apiKeyWarn: string
  hintUnderstand: string
  hintVerbal: string
  hintCodeReview: string
  hintInterviewer: string
  readyToBeginUserMessage: string
  codePreambleCodeReview: string
  codePreambleInterviewer: string
  placeholderVerbal: string
  placeholderCodeReview: string
  placeholderInterviewer: string
  placeholderDefault: string
  micUnavailable: string
  micActive: string
  micReady: string
  apiStable: string
  apiError: string
  apiKeyNeeded: string
  timerKicker: string
  timerAriaBudget: string
  timerAriaTimeUp: string
  timerAriaRemaining: string
  timesUpInline: string
  leftBudgetInline: string
  budgetLine: string
  timerMetaOpen: string
  timerMetaClose: string
  resetSession: string
  timeUpBanner: string
  sessionContextTitle: string
  setupTargetRole: string
  setupTargetRoleValue: string
  setupQuestion: string
  setupMode: string
  startSession: string
  voiceAiTitle: string
  microphone: string
  apiConnection: string
  voiceDetailsSummary: string
  liveTranscript: string
  livePill: string
  roleClaude: string
  composeHint: string
  loadingEditor: string
  editorWindowCodeReview: string
  editorWindowInterviewer: string
  resetEditor: string
  editorExpandCodeArea: string
  editorShrinkCodeArea: string
  runTests: string
  runTestsDisabledTitle: string
  sendCodeToChat: string
  sendCodeToChatTitle: string
  outputConsole: string
  terminalReady: string
  voiceToTextUnavailable: string
  stopVoiceInputTitle: string
  dictateVoiceTitle: string
  stopVoice: string
  voiceButton: string
  listeningNow: string
  dismiss: string
  voiceEngineLabel: string
  engineBrowser: string
  engineElevenLabs: string
  engineElevenLabsFallback: string
  engineGoogle: string
  engineGoogleFallback: string
  voiceSpeedLabel: string
  forceCloudOnly: string
  activeEnginePrefix: string
  speakClaudeReplies: string
  voicePickerLabel: string
  womanVoice: string
  womanVoiceTitleOk: string
  womanVoiceTitleNo: string
  googleVoiceLabel: string
  googleTtsKeyHint: string
  premiumVoices: string
  scanningVoices: string
  addElevenLabsHint: string
  selectedVoiceLine: string
  playSample: string
  diagnoseVoice: string
  stopSpeech: string
  stopSpeechTitle: string
  paidPlanBadge: string
  paidPlanVoiceTitle: string
  voiceTestPhrase: string
  voiceAvatarAlt: string
}

export const mockInterviewEn: MockInterviewStrings = {
  pageTitle: 'Mock interview',
  pageLead: 'Practice in a realistic interview dashboard.',
  sidebarBrandTitle: 'Interview Bot',
  sidebarBrandStatus: 'v3.2 Active',
  navSetup: 'Setup',
  navLibrary: 'Library',
  navAnalytics: 'Analytics',
  navPractice: 'Practice',
  navSettings: 'Settings',
  sidebarStartSession: 'Start session',
  mainPracticeTitle: 'Practice',
  mainSubtitle: 'Multi-provider mock interview (Claude, Gemini, OpenAI)',
  overviewInterviewerLabel: 'Current interviewer',
  interviewerName: 'Sarah Jenkins',
  interviewerRole: 'Senior Engineering Manager',
  listeningLeft: 'Live voice feedback',
  listeningRight: 'Listening',
  overviewSessionContext: 'Session context',
  overviewTargetRoleLine: 'Target role: Fullstack Engineer (System design focus)',
  overviewFocusPrefix: 'Focus area:',
  interviewPracticeFallback: 'Interview practice',
  step1Title: '1. Choose a question',
  step2Title: '2. How do you want to train?',
  step3Title: '3. Session',
  searchPlaceholder: 'Search title, description, tags…',
  emptyQuestions: 'No questions match. Clear filters or search.',
  questionSelectLabel: 'Question',
  solveWhatTests: 'What this question tests:',
  solveHowToSolve: 'How to solve (interview flow):',
  sessionTimerPrefix: 'Session timer:',
  sessionTimerMid: '—',
  includeRefAnswer:
    "Include reference answer in the model's context (stronger feedback; may reduce discovery)",
  trainUnderstandLabel: 'Understand & approach',
  trainUnderstandBlurb:
    'Coach walks through what the question tests, how to frame an answer, and common pitfalls—without dumping a full solution unless you ask.',
  trainVerbalLabel: 'Verbal answer practice',
  trainVerbalBlurb:
    'You write what you would say out loud; Claude gives structured feedback on clarity, structure, gaps, and follow-ups you might hear.',
  trainInterviewerLabel: 'Interviewer role-play',
  trainInterviewerBlurb:
    'Claude acts as the interviewer. You reply as the candidate using a VS Code–style editor for code plus optional verbal notes—like a live coding round.',
  trainCodeReviewLabel: 'Code review',
  trainCodeReviewBlurb:
    'Write code in a VS Code–style editor, send it (plus optional notes) for interview-style review—correctness, edges, complexity, and narration.',
  difficultyEasy: 'easy',
  difficultyMedium: 'medium',
  difficultyHard: 'hard',
  apiKeyWarn: 'Add an API key in AI settings above to start the mock session.',
  hintUnderstand: 'Ask follow-ups to go deeper on approach, trade-offs, or edge cases.',
  hintVerbal:
    'Send your spoken-style answer; Claude will reply with structured feedback.',
  hintCodeReview:
    'Edit code in the VS Code–style editor below, add optional notes, then send for review. Follow-ups can be notes-only or include updated code.',
  hintInterviewer:
    "Reply as the candidate: use the VS Code–style editor for code, optional notes for what you would say out loud. Claude stays in interviewer character. Turn on Speak Claude's replies to hear each reply (browser text-to-speech).",
  readyToBeginUserMessage: "I'm ready to begin the interview.",
  codePreambleCodeReview: 'Here is my solution:',
  codePreambleInterviewer: 'As the candidate, here is my code:',
  placeholderVerbal:
    'Type or use Voice to dictate what you would say in the interview, then send for feedback…',
  placeholderCodeReview: 'Optional notes, questions, or context (sent together with the editor code)…',
  placeholderInterviewer: 'Verbal answer or extra context (optional — sent with the code above)…',
  placeholderDefault: 'Follow-up message…',
  micUnavailable: 'Unavailable',
  micActive: 'Active',
  micReady: 'Ready',
  apiStable: 'Stable',
  apiError: 'Error',
  apiKeyNeeded: 'Key needed',
  timerKicker: 'Question timer',
  timerAriaBudget: 'Question time budget {total}',
  timerAriaTimeUp: 'Time is up',
  timerAriaRemaining: '{remaining} remaining of {total}',
  timesUpInline: "Time's up · budget {total}",
  leftBudgetInline: '{remaining} left · budget {total}',
  budgetLine: 'Budget {duration}',
  timerMetaOpen: ' (',
  timerMetaClose: ')',
  resetSession: 'Reset session',
  timeUpBanner: 'Budget used for this question—you can keep chatting or reset for a fresh timer.',
  sessionContextTitle: 'Session context',
  setupTargetRole: 'Target role',
  setupTargetRoleValue: 'Frontend Engineer (Interview focus)',
  setupQuestion: 'Question',
  setupMode: 'Mode',
  startSession: 'Start session',
  voiceAiTitle: 'Voice & AI',
  microphone: 'Microphone',
  apiConnection: 'API connection',
  voiceDetailsSummary: 'Voice & speech settings',
  liveTranscript: 'Live transcript',
  livePill: 'Live',
  roleClaude: 'Claude',
  composeHint: 'Tip: ⌃/⌘+Enter sends from the notes field.',
  loadingEditor: 'Loading editor…',
  editorWindowCodeReview: 'Mock interview — code',
  editorWindowInterviewer: 'Mock interview — interviewer',
  resetEditor: 'Reset',
  editorExpandCodeArea: 'Expand code area',
  editorShrinkCodeArea: 'Compact code area',
  runTests: 'Run tests',
  runTestsDisabledTitle: 'Not available in this trainer',
  sendCodeToChat: 'Send code',
  sendCodeToChatTitle:
    'Send the current editor as your next chat message (notes above are not cleared). Uses the same format as the main send button for code.',
  outputConsole: 'Output console',
  terminalReady: '> Editor ready. Send a message to get interviewer feedback.',
  voiceToTextUnavailable:
    'Voice-to-text is not available in this browser. Try Chrome, Edge, or Safari.',
  stopVoiceInputTitle: 'Stop voice input',
  dictateVoiceTitle: 'Dictate with your microphone (browser speech-to-text)',
  stopVoice: 'Stop voice',
  voiceButton: 'Voice',
  listeningNow: 'Listening… speak now',
  dismiss: 'Dismiss',
  voiceEngineLabel: 'Voice engine',
  engineBrowser: 'Browser',
  engineElevenLabs: 'ElevenLabs',
  engineElevenLabsFallback: '(fallback active)',
  engineGoogle: 'Google Cloud TTS',
  engineGoogleFallback: '(fallback active)',
  voiceSpeedLabel: 'Voice speed:',
  forceCloudOnly: 'Force cloud voice only (no browser fallback)',
  activeEnginePrefix: 'Active engine:',
  speakClaudeReplies: "Speak Claude's replies",
  voicePickerLabel: 'Voice',
  womanVoice: 'Woman voice',
  womanVoiceTitleOk: 'Pick a woman voice if your system exposes one (name-based guess)',
  womanVoiceTitleNo: 'No woman-labelled voice detected — choose from the list or install OS voices',
  googleVoiceLabel: 'Google Cloud voice',
  googleTtsKeyHint:
    'Add a Google Cloud TTS key in AI settings, or a Gemini key if your Google Cloud project has Cloud Text-to-Speech enabled on that key. Keys sync to the session as you type. If Google blocks the key, edit it under APIs & Services → Credentials: allow Cloud Text-to-Speech (or don’t restrict for local-only testing), and add your HTTP referrers (e.g. http://localhost:5173/*). See https://cloud.google.com/api-keys/docs/add-restrictions-api-keys',
  premiumVoices: 'Premium voices',
  scanningVoices: 'Scanning voices available on your plan…',
  addElevenLabsHint: 'Add ElevenLabs key in API settings to enable premium audio.',
  selectedVoiceLine: 'Selected:',
  playSample: 'Play sample',
  diagnoseVoice: 'Diagnose voice',
  stopSpeech: 'Stop speech',
  stopSpeechTitle: 'Stop reading the reply aloud',
  paidPlanBadge: 'Paid plan required',
  paidPlanVoiceTitle: 'Paid ElevenLabs plan required for API usage',
  voiceTestPhrase:
    'This is a voice test. I will guide you through your interview answer with concise feedback.',
  voiceAvatarAlt: '{name} voice avatar',
}

export const mockInterviewHe: MockInterviewStrings = {
  pageTitle: 'ראיון דמה',
  pageLead: 'תרגול בלוח בקרה בסגנון ראיון אמיתי.',
  sidebarBrandTitle: 'בוט ראיונות',
  sidebarBrandStatus: 'גרסה 3.2 פעיל',
  navSetup: 'הקמה',
  navLibrary: 'ספרייה',
  navAnalytics: 'אנליטיקה',
  navPractice: 'תרגול',
  navSettings: 'הגדרות',
  sidebarStartSession: 'התחל מפגש',
  mainPracticeTitle: 'תרגול',
  mainSubtitle: 'ראיון דמה עם כמה ספקי AI (Claude, Gemini, OpenAI)',
  overviewInterviewerLabel: 'מראיין/ת נוכחי/ת',
  interviewerName: 'שרה ג׳נקינס',
  interviewerRole: 'מנהלת הנדסה בכירה',
  listeningLeft: 'משוב קולי חי',
  listeningRight: 'מאזינים',
  overviewSessionContext: 'הקשר המפגש',
  overviewTargetRoleLine: 'תפקיד יעד: מהנדס/ת פולסטאק (מיקוד בעיצוב מערכות)',
  overviewFocusPrefix: 'אזור מיקוד:',
  interviewPracticeFallback: 'תרגול לראיון',
  step1Title: '1. בחרו שאלה',
  step2Title: '2. איך לתרגל?',
  step3Title: '3. מפגש',
  searchPlaceholder: 'חיפוש בכותרת, תיאור, תגיות…',
  emptyQuestions: 'אין התאמות. נקו סינון או חיפוש.',
  questionSelectLabel: 'שאלה',
  solveWhatTests: 'מה השאלה בודקת:',
  solveHowToSolve: 'איך לפתור (זרימת ראיון):',
  sessionTimerPrefix: 'טיימר מפגש:',
  sessionTimerMid: '—',
  includeRefAnswer:
    'כלול תשובת ייחוס בהקשר של המודל (משוב חזק יותר; עלול להפחית גילוי עצמי)',
  trainUnderstandLabel: 'הבנה וגישה',
  trainUnderstandBlurb:
    'מאמן מוביל: מה השאלה בודקת, איך לבנות תשובה ומה מלכודות נפוצות—בלי לתת פתרון מלא אלא אם תבקשו.',
  trainVerbalLabel: 'תרגול תשובה מילולית',
  trainVerbalBlurb:
    'כותבים מה הייתם אומרים בקול; קלוד נותן משוב מובנה על בהירות, מבנה, פערים ושאלות המשך.',
  trainInterviewerLabel: 'תרגול מראיין',
  trainInterviewerBlurb:
    'קלוד במסגרת מראיין/ת. אתם כמועמד/ת: עורך בסגנון VS Code לקוד והערות מילוליות אופציונליות—כמו סבב קוד חי.',
  trainCodeReviewLabel: 'סקירת קוד',
  trainCodeReviewBlurb:
    'כותבים קוד בעורך בסגנון VS Code, שולחים (עם הערות אופציונליות) לסקירה בסגנון ראיון—נכונות, קצוות, סיבוכיות והסבר.',
  difficultyEasy: 'קל',
  difficultyMedium: 'בינוני',
  difficultyHard: 'קשה',
  apiKeyWarn: 'הוסיפו מפתח API בהגדרות AI למעלה כדי להתחיל את מפגש הדמה.',
  hintUnderstand: 'שלחו המשכים כדי לעמיק בגישה, בפשרות (trade-offs) או במקרי קצה.',
  hintVerbal: 'שלחו תשובה בסגנון דיבור; קלוד יחזיר משוב מובנה.',
  hintCodeReview:
    'ערכו קוד בעורך בסגנון VS Code למטה, הוסיפו הערות אופציונליות, ואז שלחו לסקירה. המשכים יכולים להיות הערות בלבד או עם קוד מעודכן.',
  hintInterviewer:
    'ענו כמועמד/ת: עורך VS Code לקוד, הערות אופציונליות למה שהייתם אומרים בקול. קלוד נשאר בדמות מראיין. הפעילו ״הקרא תשובות קלוד״ לשמיעה (דיבור בדפדפן).',
  readyToBeginUserMessage: 'אני מוכן/ה להתחיל את הראיון.',
  codePreambleCodeReview: 'הנה הפתרון שלי:',
  codePreambleInterviewer: 'כמועמד/ת, הנה הקוד שלי:',
  placeholderVerbal:
    'הקלידו או השתמשו בקול כדי לכתוב מה הייתם אומרים בראיון, ואז שלחו למשוב…',
  placeholderCodeReview: 'הערות, שאלות או הקשר אופציונלי (נשלח יחד עם הקוד בעורך)…',
  placeholderInterviewer: 'תשובה מילולית או הקשר נוסף (אופציונלי — נשלח עם הקוד למעלה)…',
  placeholderDefault: 'הודעת המשך…',
  micUnavailable: 'לא זמין',
  micActive: 'פעיל',
  micReady: 'מוכן',
  apiStable: 'יציב',
  apiError: 'שגיאה',
  apiKeyNeeded: 'נדרש מפתח',
  timerKicker: 'טיימר שאלה',
  timerAriaBudget: 'תקציב זמן לשאלה {total}',
  timerAriaTimeUp: 'הזמן נגמר',
  timerAriaRemaining: 'נותרו {remaining} מתוך {total}',
  timesUpInline: 'הזמן נגמר · תקציב {total}',
  leftBudgetInline: 'נותרו {remaining} · תקציב {total}',
  budgetLine: 'תקציב {duration}',
  timerMetaOpen: ' (',
  timerMetaClose: ')',
  resetSession: 'איפוס מפגש',
  timeUpBanner: 'נוצל תקציב הזמן לשאלה זו—אפשר להמשיך לצ׳אט או לאפס לטיימר חדש.',
  sessionContextTitle: 'הקשר מפגש',
  setupTargetRole: 'תפקיד יעד',
  setupTargetRoleValue: 'מהנדס/ת פרונטאנד (מיקוד ראיון)',
  setupQuestion: 'שאלה',
  setupMode: 'מצב',
  startSession: 'התחל מפגש',
  voiceAiTitle: 'קול ו-AI',
  microphone: 'מיקרופון',
  apiConnection: 'חיבור API',
  voiceDetailsSummary: 'הגדרות קול ודיבור',
  liveTranscript: 'תמליל חי',
  livePill: 'חי',
  roleClaude: 'Claude',
  composeHint: 'טיפ: ⌃/⌘+Enter שולח משדה ההערות.',
  loadingEditor: 'טוען עורך…',
  editorWindowCodeReview: 'ראיון דמה — קוד',
  editorWindowInterviewer: 'ראיון דמה — מראיין',
  resetEditor: 'איפוס',
  editorExpandCodeArea: 'הרחבת אזור הקוד',
  editorShrinkCodeArea: 'צמצום אזור הקוד',
  runTests: 'הרץ בדיקות',
  runTestsDisabledTitle: 'לא זמין במאמן זה',
  sendCodeToChat: 'שליחת קוד',
  sendCodeToChatTitle:
    'שולח את תוכן העורך כהודעה הבאה בצ׳אט (שדה ההערות למעלה לא מתנקה). אותו פורמט כמו שליחה רגילה עם קוד.',
  outputConsole: 'קונסול פלט',
  terminalReady: '> העורך מוכן. שלחו הודעה לקבלת משוב מראיין.',
  voiceToTextUnavailable:
    'הקלטת קול לטקסט לא זמינה בדפדפן זה. נסו Chrome, Edge או Safari.',
  stopVoiceInputTitle: 'עצור קלט קול',
  dictateVoiceTitle: 'הכתבה במיקרופון (דיבור לטקסט בדפדפן)',
  stopVoice: 'עצור קול',
  voiceButton: 'קול',
  listeningNow: 'מאזינים… דברו עכשיו',
  dismiss: 'סגור',
  voiceEngineLabel: 'מנוע קול',
  engineBrowser: 'דפדפן',
  engineElevenLabs: 'ElevenLabs',
  engineElevenLabsFallback: '(גיבוי פעיל)',
  engineGoogle: 'Google Cloud TTS',
  engineGoogleFallback: '(גיבוי פעיל)',
  voiceSpeedLabel: 'מהירות קול:',
  forceCloudOnly: 'כפה קול בענן בלבד (בלי גיבוי דפדפן)',
  activeEnginePrefix: 'מנוע פעיל:',
  speakClaudeReplies: 'הקרא תשובות Claude',
  voicePickerLabel: 'קול',
  womanVoice: 'קול אישה',
  womanVoiceTitleOk: 'בחרו קול מסומן כאישה אם המערכת מציעה (הערכה לפי שם)',
  womanVoiceTitleNo: 'לא זוהה קול מסומן כאישה — בחרו מהרשימה או התקינו קולות במערכת',
  googleVoiceLabel: 'קול Google Cloud',
  googleTtsKeyHint:
    'הוסיפו מפתח Google Cloud TTS בהגדרות AI, או מפתח Gemini אם בפרויקט Google Cloud שלכם מופעל Text-to-Speech על אותו מפתח. המפתחות מסתנכרנים למפגש תוך כדי הקלדה. אם Google חוסמת את המפתח, ערכו אותו ב־APIs & Services → Credentials: אפשרו Cloud Text-to-Speech (או אל תגבילו את המפתח לבדיקות מקומיות בלבד), והוסיפו HTTP referrers (למשל http://localhost:5173/*). https://cloud.google.com/api-keys/docs/add-restrictions-api-keys',
  premiumVoices: 'קולות פרימיום',
  scanningVoices: 'סורקים קולות זמינים בתוכנית שלכם…',
  addElevenLabsHint: 'הוסיפו מפתח ElevenLabs בהגדרות API כדי להפעיל אודיו פרימיום.',
  selectedVoiceLine: 'נבחר:',
  playSample: 'נגן דוגמה',
  diagnoseVoice: 'אבחון קול',
  stopSpeech: 'עצור הקראה',
  stopSpeechTitle: 'עצור את ההקראה בקול',
  paidPlanBadge: 'נדרשת תוכנית בתשלום',
  paidPlanVoiceTitle: 'נדרשת תוכנית ElevenLabs בתשלום לשימוש ב-API',
  voiceTestPhrase: 'זו בדיקת קול. כך יישמע המשוב בתשובת הראיון.',
  voiceAvatarAlt: 'אווטר קול {name}',
}
