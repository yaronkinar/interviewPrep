import type { Page } from '../page'
import type { Locale } from './locale'

export type HomeStrings = {
  metaTitle: string
  heroTitle: string
  heroLead: string
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
  }
  cta: string
}

export type AppStrings = {
  nav: Record<Page, string>
  home: HomeStrings
}

const en: AppStrings = {
  nav: {
    home: 'Home',
    js: 'JS Patterns',
    react: 'React Questions',
    sandbox: 'React sandbox',
    mock: 'Mock interview',
    questions: 'Company Q&A',
  },
  home: {
    metaTitle: 'Interview Prep — practice in the browser',
    heroTitle: 'Interview Prep',
    heroLead:
      'Practice JavaScript patterns, React concepts, company-style questions, and AI mock interviews — all in your browser.',
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
    },
    cta: 'Choose a section from the navigation above to get started.',
  },
}

const he: AppStrings = {
  nav: {
    home: 'בית',
    js: 'דפוסי JS',
    react: 'שאלות React',
    sandbox: 'ארגז חול React',
    mock: 'ראיון דמה',
    questions: 'שאלות ותשובות',
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
    },
    cta: 'בחרו אזור מהתפריט למעלה כדי להתחיל.',
  },
}

const es: AppStrings = {
  nav: {
    home: 'Inicio',
    js: 'Patrones JS',
    react: 'Preguntas React',
    sandbox: 'Sandbox React',
    mock: 'Simulacro',
    questions: 'P&R empresas',
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
    },
    cta: 'Elige una sección en la barra superior para empezar.',
  },
}

const fr: AppStrings = {
  nav: {
    home: 'Accueil',
    js: 'Patterns JS',
    react: 'Questions React',
    sandbox: 'Bac à sable React',
    mock: 'Entretien blanc',
    questions: 'Q&R entreprises',
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
    },
    cta: 'Choisissez une section dans la barre du haut pour commencer.',
  },
}

const de: AppStrings = {
  nav: {
    home: 'Start',
    js: 'JS-Muster',
    react: 'React-Fragen',
    sandbox: 'React-Sandbox',
    mock: 'Probegespräch',
    questions: 'Firmen-F&A',
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
    },
    cta: 'Wähle oben in der Navigation einen Bereich, um zu starten.',
  },
}

const pt: AppStrings = {
  nav: {
    home: 'Início',
    js: 'Padrões JS',
    react: 'Perguntas React',
    sandbox: 'Sandbox React',
    mock: 'Simulado',
    questions: 'P&R empresas',
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
    },
    cta: 'Escolha uma seção na barra acima para começar.',
  },
}

const ja: AppStrings = {
  nav: {
    home: 'ホーム',
    js: 'JS パターン',
    react: 'React 質問',
    sandbox: 'React サンドボックス',
    mock: '模擬面接',
    questions: '企業 Q&A',
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
    },
    cta: '上のナビからセクションを選んで始めてください。',
  },
}

const zh: AppStrings = {
  nav: {
    home: '首页',
    js: 'JS 模式',
    react: 'React 题库',
    sandbox: 'React 沙箱',
    mock: '模拟面试',
    questions: '公司问答',
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
    },
    cta: '请从上方导航选择要开始的区域。',
  },
}

const ar: AppStrings = {
  nav: {
    home: 'الرئيسية',
    js: 'أنماط JS',
    react: 'أسئلة React',
    sandbox: 'بيئة React',
    mock: 'مقابلة تجريبية',
    questions: 'أسئلة الشركات',
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
    },
    cta: 'اختر قسماً من شريط التنقل أعلاه للبدء.',
  },
}

const ru: AppStrings = {
  nav: {
    home: 'Главная',
    js: 'Паттерны JS',
    react: 'Вопросы React',
    sandbox: 'Песочница React',
    mock: 'Пробное интервью',
    questions: 'Вопросы компаний',
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
    },
    cta: 'Выберите раздел в верхней навигации, чтобы начать.',
  },
}

const hi: AppStrings = {
  nav: {
    home: 'होम',
    js: 'JS पैटर्न',
    react: 'React प्रश्न',
    sandbox: 'React सैंडबॉक्स',
    mock: 'मॉक इंटरव्यू',
    questions: 'कंपनी Q&A',
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
    },
    cta: 'शुरू करने के लिए ऊपर नेविगेशन से एक खंड चुनें।',
  },
}

const pl: AppStrings = {
  nav: {
    home: 'Start',
    js: 'Wzorce JS',
    react: 'Pytania React',
    sandbox: 'Piaskownica React',
    mock: 'Mock interview',
    questions: 'Pytania firm',
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
    },
    cta: 'Wybierz sekcję w górnym menu, aby zacząć.',
  },
}

const ko: AppStrings = {
  nav: {
    home: '홈',
    js: 'JS 패턴',
    react: 'React 질문',
    sandbox: 'React 샌드박스',
    mock: '모의 면접',
    questions: '기업 Q&A',
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
    },
    cta: '위에서 시작할 섹션을 선택하세요.',
  },
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
  return STRINGS_BY_LOCALE[locale] ?? en
}
