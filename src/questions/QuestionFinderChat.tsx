'use client'

import { useMemo, useState } from 'react'
import { MessageCircle, Search, X } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleContext'
import { isRtlLocale, type Locale } from '@/i18n/locale'
import { COMPANIES, type Category, type Difficulty, type Question } from './data'

type QuestionFinderMatch = {
  question: Question
  score: number
  matchedFields: string[]
  snippet: string
}

type QuestionFinderResponse = {
  query?: string
  filters?: {
    difficulty?: Difficulty
    category?: Category
    company?: string
  }
  matches?: QuestionFinderMatch[]
  error?: string
}

type FinderMessage = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

type QuestionFinderChatProps = {
  onApplySearch: (query: string) => void
  onOpenQuestion?: (question: Question) => void
  variant?: 'inline' | 'floating'
  applyLabel?: string
}

const PREDEFINED_SEARCHES = [
  { key: 'googleAsync', query: 'hard async questions for Google' },
  { key: 'reactPerformance', query: 'react performance medium' },
  { key: 'closuresBasics', query: 'closure scope easy' },
  { key: 'systemDesign', query: 'frontend system design hard' },
  { key: 'promisePractice', query: 'promise async medium' },
  { key: 'domBrowser', query: 'dom browser easy' },
  { key: 'plainIdPrep', query: 'PlainID frontend questions' },
  { key: 'algorithms', query: 'algorithm coding questions' },
] as const

type FinderPresetKey = (typeof PREDEFINED_SEARCHES)[number]['key']
type FinderCopy = {
  fab: string
  openAria: string
  closeAria: string
  kicker: string
  title: string
  welcome: string
  finder: string
  you: string
  searching: string
  placeholder: string
  searchButton: string
  presetsLabel: string
  matchedQuestions: string
  openResultsPage?: string
  openQuestion: string
  score: string
  matched: string
  fallbackError: string
  noResults: (query: string) => string
  found: (count: number, filters: string) => string
  presets: Record<FinderPresetKey, string>
  add?: Partial<AddQuestionCopy>
}

type AddQuestionCopy = {
  suggestButton: string
  suggesting: string
  webSearchButton: string
  webSearching: string
  suggestedQuestions: string
  companyWhenAdding: string
  addQuestion: string
  addingQuestion: string
  suggestFallbackError: string
  addFallbackError: string
  unauthorized: string
  noSuggestions: (query: string) => string
  suggested: (count: number) => string
  webSuggested: (count: number) => string
  webNoResults: (query: string) => string
  added: (title: string) => string
}

const defaultAddQuestionCopy: AddQuestionCopy = {
  suggestButton: 'Suggest new questions',
  suggesting: 'Suggesting...',
  webSearchButton: 'Search web (AI)',
  webSearching: 'Searching the web...',
  suggestedQuestions: 'Suggested questions',
  companyWhenAdding: 'Company tag (when adding)',
  addQuestion: 'Add question',
  addingQuestion: 'Adding...',
  suggestFallbackError: 'Failed to suggest questions.',
  addFallbackError: 'Failed to add question.',
  unauthorized: 'Only signed-in admins can add questions.',
  noSuggestions: query => `I could not suggest new questions for "${query}". Try a more specific topic.`,
  suggested: count => `I suggested ${count} new question${count === 1 ? '' : 's'} you can add to the catalog.`,
  webSuggested: count =>
    `I generated ${count} question${count === 1 ? '' : 's'} from web results; review and add the ones you want to MongoDB.`,
  webNoResults: query => `Web search did not return usable results for "${query}". Try a different phrasing or topic.`,
  added: title => `Added "${title}" to the catalog.`,
}

const finderCopyByLocale = {
  en: {
    fab: 'Find questions',
    openAria: 'Open question finder chat',
    closeAria: 'Close question finder chat',
    kicker: 'Fuzzy finder',
    title: 'Find questions by chatting',
    welcome:
      'Tell me what kind of interview questions you want. I search the existing catalog. Admins can also generate questions with AI, or use web search, then add them to the database.',
    finder: 'Finder',
    you: 'You',
    searching: 'Searching...',
    placeholder: 'Try: hard async questions for Google',
    searchButton: 'Search catalog',
    presetsLabel: 'Predefined searches',
    matchedQuestions: 'Matched questions',
    openResultsPage: 'Open results page',
    openQuestion: 'Open question',
    score: 'Score',
    matched: 'Matched',
    fallbackError: 'Failed to search questions.',
    noResults: (query: string) => `I could not find existing questions for "${query}". Try a broader topic or a company/category name.`,
    found: (count: number, filters: string) => `I found ${count} existing question${count === 1 ? '' : 's'}${filters ? ` using ${filters}` : ''}.`,
    add: defaultAddQuestionCopy,
    presets: {
      googleAsync: 'Google hard async',
      reactPerformance: 'React performance',
      closuresBasics: 'Closures basics',
      systemDesign: 'System design',
      promisePractice: 'Promise practice',
      domBrowser: 'DOM browser',
      plainIdPrep: 'PlainID prep',
      algorithms: 'Algorithms',
    },
  },
  he: {
    fab: 'מצא שאלות',
    openAria: 'פתח צ׳אט למציאת שאלות',
    closeAria: 'סגור צ׳אט למציאת שאלות',
    kicker: 'חיפוש חכם',
    title: 'מצא שאלות בצ׳אט',
    welcome: 'כתוב איזה סוג שאלות ראיון אתה מחפש. אני מחפש בקטלוג הקיים עם התאמה גמישה.',
    finder: 'מחפש',
    you: 'אתה',
    searching: 'מחפש...',
    placeholder: 'לדוגמה: שאלות async קשות ל-Google',
    searchButton: 'חפש בקטלוג',
    presetsLabel: 'חיפושים מוכנים',
    matchedQuestions: 'שאלות שנמצאו',
    openResultsPage: 'פתח דף תוצאות',
    openQuestion: 'פתח שאלה',
    score: 'ציון',
    matched: 'התאמה',
    fallbackError: 'חיפוש השאלות נכשל.',
    noResults: (query: string) => `לא מצאתי שאלות קיימות עבור "${query}". נסה נושא רחב יותר או שם חברה/קטגוריה.`,
    found: (count: number, filters: string) => `מצאתי ${count} שאלות קיימות${filters ? ` עם ${filters}` : ''}.`,
    presets: {
      googleAsync: 'Google async קשה',
      reactPerformance: 'ביצועי React',
      closuresBasics: 'בסיס Closures',
      systemDesign: 'System design',
      promisePractice: 'תרגול Promises',
      domBrowser: 'DOM ודפדפן',
      plainIdPrep: 'הכנה ל-PlainID',
      algorithms: 'אלגוריתמים',
    },
  },
  es: {
    fab: 'Buscar preguntas',
    openAria: 'Abrir chat para buscar preguntas',
    closeAria: 'Cerrar chat para buscar preguntas',
    kicker: 'Buscador flexible',
    title: 'Busca preguntas con chat',
    welcome: 'Dime qué tipo de preguntas de entrevista quieres. Buscaré en el catálogo existente con coincidencia flexible.',
    finder: 'Buscador',
    you: 'Tú',
    searching: 'Buscando...',
    placeholder: 'Prueba: preguntas async difíciles para Google',
    searchButton: 'Buscar en catálogo',
    presetsLabel: 'Búsquedas predefinidas',
    matchedQuestions: 'Preguntas encontradas',
    openQuestion: 'Abrir pregunta',
    score: 'Puntuación',
    matched: 'Coincidió',
    fallbackError: 'No se pudieron buscar preguntas.',
    noResults: (query: string) => `No encontré preguntas existentes para "${query}". Prueba con un tema más amplio o una empresa/categoría.`,
    found: (count: number, filters: string) => `Encontré ${count} pregunta${count === 1 ? '' : 's'} existente${count === 1 ? '' : 's'}${filters ? ` usando ${filters}` : ''}.`,
    presets: {
      googleAsync: 'Async difícil Google',
      reactPerformance: 'Rendimiento React',
      closuresBasics: 'Closures básicos',
      systemDesign: 'System design',
      promisePractice: 'Práctica Promises',
      domBrowser: 'DOM y navegador',
      plainIdPrep: 'Prep PlainID',
      algorithms: 'Algoritmos',
    },
  },
  fr: {
    fab: 'Trouver des questions',
    openAria: 'Ouvrir le chat de recherche de questions',
    closeAria: 'Fermer le chat de recherche de questions',
    kicker: 'Recherche floue',
    title: 'Trouver des questions par chat',
    welcome: 'Dis-moi quel type de questions d’entretien tu veux. Je cherche dans le catalogue avec une recherche tolérante.',
    finder: 'Recherche',
    you: 'Vous',
    searching: 'Recherche...',
    placeholder: 'Ex: questions async difficiles pour Google',
    searchButton: 'Chercher',
    presetsLabel: 'Recherches prédéfinies',
    matchedQuestions: 'Questions trouvées',
    openQuestion: 'Ouvrir la question',
    score: 'Score',
    matched: 'Correspondance',
    fallbackError: 'La recherche a échoué.',
    noResults: (query: string) => `Je n’ai trouvé aucune question existante pour "${query}". Essaie un sujet plus large ou une entreprise/catégorie.`,
    found: (count: number, filters: string) => `J’ai trouvé ${count} question${count === 1 ? '' : 's'} existante${count === 1 ? '' : 's'}${filters ? ` avec ${filters}` : ''}.`,
    presets: {
      googleAsync: 'Google async difficile',
      reactPerformance: 'Performance React',
      closuresBasics: 'Bases des closures',
      systemDesign: 'System design',
      promisePractice: 'Pratique Promises',
      domBrowser: 'DOM navigateur',
      plainIdPrep: 'Prépa PlainID',
      algorithms: 'Algorithmes',
    },
  },
  de: {
    fab: 'Fragen finden',
    openAria: 'Chat zur Fragensuche öffnen',
    closeAria: 'Chat zur Fragensuche schließen',
    kicker: 'Fuzzy-Suche',
    title: 'Fragen per Chat finden',
    welcome: 'Sag mir, welche Interviewfragen du suchst. Ich suche im bestehenden Katalog mit Fuzzy Matching.',
    finder: 'Finder',
    you: 'Du',
    searching: 'Suche...',
    placeholder: 'Beispiel: schwere Async-Fragen für Google',
    searchButton: 'Katalog suchen',
    presetsLabel: 'Vordefinierte Suchen',
    matchedQuestions: 'Gefundene Fragen',
    openQuestion: 'Frage öffnen',
    score: 'Score',
    matched: 'Treffer',
    fallbackError: 'Fragensuche fehlgeschlagen.',
    noResults: (query: string) => `Ich konnte keine vorhandenen Fragen für "${query}" finden. Versuche ein breiteres Thema oder eine Firma/Kategorie.`,
    found: (count: number, filters: string) => `Ich habe ${count} vorhandene Frage${count === 1 ? '' : 'n'} gefunden${filters ? ` mit ${filters}` : ''}.`,
    presets: {
      googleAsync: 'Google Async schwer',
      reactPerformance: 'React Performance',
      closuresBasics: 'Closures Grundlagen',
      systemDesign: 'System Design',
      promisePractice: 'Promise Übung',
      domBrowser: 'DOM Browser',
      plainIdPrep: 'PlainID Vorbereitung',
      algorithms: 'Algorithmen',
    },
  },
  pt: {
    fab: 'Encontrar perguntas',
    openAria: 'Abrir chat de busca de perguntas',
    closeAria: 'Fechar chat de busca de perguntas',
    kicker: 'Busca fuzzy',
    title: 'Encontre perguntas por chat',
    welcome: 'Diga que tipo de perguntas de entrevista voce quer. Eu busco no catalogo existente com correspondencia flexivel.',
    finder: 'Buscador',
    you: 'Voce',
    searching: 'Buscando...',
    placeholder: 'Tente: perguntas async dificeis para Google',
    searchButton: 'Buscar no catalogo',
    presetsLabel: 'Buscas predefinidas',
    matchedQuestions: 'Perguntas encontradas',
    openQuestion: 'Abrir pergunta',
    score: 'Pontuacao',
    matched: 'Encontrado',
    fallbackError: 'Falha ao buscar perguntas.',
    noResults: (query: string) => `Nao encontrei perguntas existentes para "${query}". Tente um tema mais amplo ou empresa/categoria.`,
    found: (count: number, filters: string) => `Encontrei ${count} pergunta${count === 1 ? '' : 's'} existente${count === 1 ? '' : 's'}${filters ? ` usando ${filters}` : ''}.`,
    presets: {
      googleAsync: 'Google async dificil',
      reactPerformance: 'Performance React',
      closuresBasics: 'Closures basico',
      systemDesign: 'System design',
      promisePractice: 'Pratica Promises',
      domBrowser: 'DOM navegador',
      plainIdPrep: 'Prep PlainID',
      algorithms: 'Algoritmos',
    },
  },
  ja: {
    fab: '質問を探す',
    openAria: '質問検索チャットを開く',
    closeAria: '質問検索チャットを閉じる',
    kicker: 'ファジー検索',
    title: 'チャットで質問を探す',
    welcome: '探したい面接質問の種類を入力してください。既存カタログをファジー検索します。',
    finder: '検索',
    you: 'あなた',
    searching: '検索中...',
    placeholder: '例: Google 向けの難しい async 質問',
    searchButton: 'カタログを検索',
    presetsLabel: '定義済み検索',
    matchedQuestions: '一致した質問',
    openQuestion: '質問を開く',
    score: 'スコア',
    matched: '一致',
    fallbackError: '質問の検索に失敗しました。',
    noResults: (query: string) => `"${query}" に一致する既存の質問が見つかりませんでした。より広いトピックや会社/カテゴリを試してください。`,
    found: (count: number, filters: string) => `${count} 件の既存質問が見つかりました${filters ? ` (${filters})` : ''}。`,
    presets: {
      googleAsync: 'Google async 難問',
      reactPerformance: 'React パフォーマンス',
      closuresBasics: 'Closures 基礎',
      systemDesign: 'System design',
      promisePractice: 'Promise 練習',
      domBrowser: 'DOM ブラウザ',
      plainIdPrep: 'PlainID 対策',
      algorithms: 'アルゴリズム',
    },
  },
  zh: {
    fab: '查找问题',
    openAria: '打开问题查找聊天',
    closeAria: '关闭问题查找聊天',
    kicker: '模糊搜索',
    title: '通过聊天查找问题',
    welcome: '告诉我你想找哪类面试题。我会在现有题库中进行模糊搜索。',
    finder: '查找器',
    you: '你',
    searching: '搜索中...',
    placeholder: '试试：Google hard async questions',
    searchButton: '搜索题库',
    presetsLabel: '预设搜索',
    matchedQuestions: '匹配的问题',
    openQuestion: '打开问题',
    score: '分数',
    matched: '匹配',
    fallbackError: '搜索问题失败。',
    noResults: (query: string) => `没有找到 "${query}" 的现有问题。请尝试更宽泛的主题或公司/分类名称。`,
    found: (count: number, filters: string) => `找到 ${count} 个现有问题${filters ? `，条件：${filters}` : ''}。`,
    presets: {
      googleAsync: 'Google async 难题',
      reactPerformance: 'React 性能',
      closuresBasics: 'Closures 基础',
      systemDesign: 'System design',
      promisePractice: 'Promise 练习',
      domBrowser: 'DOM 浏览器',
      plainIdPrep: 'PlainID 准备',
      algorithms: '算法',
    },
  },
  ar: {
    fab: 'ابحث عن أسئلة',
    openAria: 'فتح دردشة البحث عن الأسئلة',
    closeAria: 'إغلاق دردشة البحث عن الأسئلة',
    kicker: 'بحث مرن',
    title: 'ابحث عن الأسئلة بالدردشة',
    welcome: 'اكتب نوع أسئلة المقابلات الذي تريده. سأبحث في الكتالوج الحالي ببحث مرن.',
    finder: 'الباحث',
    you: 'أنت',
    searching: 'جار البحث...',
    placeholder: 'مثال: أسئلة async صعبة لـ Google',
    searchButton: 'ابحث في الكتالوج',
    presetsLabel: 'عمليات بحث جاهزة',
    matchedQuestions: 'الأسئلة المطابقة',
    openQuestion: 'افتح السؤال',
    score: 'النتيجة',
    matched: 'مطابق',
    fallbackError: 'فشل البحث عن الأسئلة.',
    noResults: (query: string) => `لم أجد أسئلة موجودة لـ "${query}". جرّب موضوعا أوسع أو اسم شركة/تصنيف.`,
    found: (count: number, filters: string) => `وجدت ${count} سؤالا موجودا${filters ? ` باستخدام ${filters}` : ''}.`,
    presets: {
      googleAsync: 'Google async صعب',
      reactPerformance: 'أداء React',
      closuresBasics: 'أساسيات Closures',
      systemDesign: 'System design',
      promisePractice: 'تدريب Promises',
      domBrowser: 'DOM والمتصفح',
      plainIdPrep: 'تحضير PlainID',
      algorithms: 'الخوارزميات',
    },
  },
  ru: {
    fab: 'Найти вопросы',
    openAria: 'Открыть чат поиска вопросов',
    closeAria: 'Закрыть чат поиска вопросов',
    kicker: 'Нечеткий поиск',
    title: 'Найти вопросы в чате',
    welcome: 'Напишите, какие вопросы для интервью вам нужны. Я ищу по существующему каталогу с нечетким совпадением.',
    finder: 'Поиск',
    you: 'Вы',
    searching: 'Ищу...',
    placeholder: 'Например: сложные async вопросы для Google',
    searchButton: 'Искать в каталоге',
    presetsLabel: 'Готовые поиски',
    matchedQuestions: 'Найденные вопросы',
    openQuestion: 'Открыть вопрос',
    score: 'Оценка',
    matched: 'Совпало',
    fallbackError: 'Не удалось найти вопросы.',
    noResults: (query: string) => `Я не нашел существующих вопросов для "${query}". Попробуйте более широкую тему или компанию/категорию.`,
    found: (count: number, filters: string) => `Найдено существующих вопросов: ${count}${filters ? ` с ${filters}` : ''}.`,
    presets: {
      googleAsync: 'Google async сложно',
      reactPerformance: 'Производительность React',
      closuresBasics: 'Основы Closures',
      systemDesign: 'System design',
      promisePractice: 'Практика Promises',
      domBrowser: 'DOM браузер',
      plainIdPrep: 'Подготовка PlainID',
      algorithms: 'Алгоритмы',
    },
  },
  hi: {
    fab: 'प्रश्न खोजें',
    openAria: 'प्रश्न खोज चैट खोलें',
    closeAria: 'प्रश्न खोज चैट बंद करें',
    kicker: 'फज़ी खोज',
    title: 'चैट से प्रश्न खोजें',
    welcome: 'बताइए आपको किस तरह के इंटरव्यू प्रश्न चाहिए। मैं मौजूदा कैटलॉग में फज़ी मैचिंग से खोजूंगा।',
    finder: 'खोज',
    you: 'आप',
    searching: 'खोज रहा है...',
    placeholder: 'जैसे: Google के लिए कठिन async प्रश्न',
    searchButton: 'कैटलॉग खोजें',
    presetsLabel: 'पहले से बने खोज',
    matchedQuestions: 'मिले हुए प्रश्न',
    openQuestion: 'प्रश्न खोलें',
    score: 'स्कोर',
    matched: 'मैच',
    fallbackError: 'प्रश्न खोजने में विफल।',
    noResults: (query: string) => `"${query}" के लिए मौजूदा प्रश्न नहीं मिले। कोई व्यापक विषय या कंपनी/कैटेगरी आज़माएं।`,
    found: (count: number, filters: string) => `${count} मौजूदा प्रश्न मिले${filters ? ` (${filters})` : ''}.`,
    presets: {
      googleAsync: 'Google async कठिन',
      reactPerformance: 'React performance',
      closuresBasics: 'Closures basics',
      systemDesign: 'System design',
      promisePractice: 'Promise practice',
      domBrowser: 'DOM browser',
      plainIdPrep: 'PlainID prep',
      algorithms: 'Algorithms',
    },
  },
  pl: {
    fab: 'Znajdź pytania',
    openAria: 'Otwórz czat wyszukiwania pytań',
    closeAria: 'Zamknij czat wyszukiwania pytań',
    kicker: 'Wyszukiwanie fuzzy',
    title: 'Znajdź pytania przez czat',
    welcome: 'Napisz, jakich pytań rekrutacyjnych szukasz. Przeszukam istniejący katalog z dopasowaniem fuzzy.',
    finder: 'Wyszukiwarka',
    you: 'Ty',
    searching: 'Szukam...',
    placeholder: 'Spróbuj: trudne pytania async dla Google',
    searchButton: 'Szukaj w katalogu',
    presetsLabel: 'Gotowe wyszukiwania',
    matchedQuestions: 'Dopasowane pytania',
    openQuestion: 'Otwórz pytanie',
    score: 'Wynik',
    matched: 'Dopasowano',
    fallbackError: 'Nie udało się wyszukać pytań.',
    noResults: (query: string) => `Nie znalazłem istniejących pytań dla "${query}". Spróbuj szerszego tematu albo firmy/kategorii.`,
    found: (count: number, filters: string) => `Znalazłem ${count} istniejące pytanie/pytania${filters ? ` używając ${filters}` : ''}.`,
    presets: {
      googleAsync: 'Google async trudne',
      reactPerformance: 'Wydajność React',
      closuresBasics: 'Podstawy Closures',
      systemDesign: 'System design',
      promisePractice: 'Ćwiczenie Promises',
      domBrowser: 'DOM przeglądarka',
      plainIdPrep: 'Przygotowanie PlainID',
      algorithms: 'Algorytmy',
    },
  },
  ko: {
    fab: '질문 찾기',
    openAria: '질문 찾기 채팅 열기',
    closeAria: '질문 찾기 채팅 닫기',
    kicker: '퍼지 검색',
    title: '채팅으로 질문 찾기',
    welcome: '원하는 면접 질문 유형을 말해 주세요. 기존 카탈로그에서 퍼지 검색으로 찾습니다.',
    finder: '검색',
    you: '나',
    searching: '검색 중...',
    placeholder: '예: Google 어려운 async 질문',
    searchButton: '카탈로그 검색',
    presetsLabel: '미리 정의된 검색',
    matchedQuestions: '일치한 질문',
    openQuestion: '질문 열기',
    score: '점수',
    matched: '일치',
    fallbackError: '질문 검색에 실패했습니다.',
    noResults: (query: string) => `"${query}"에 대한 기존 질문을 찾지 못했습니다. 더 넓은 주제나 회사/카테고리를 시도해 보세요.`,
    found: (count: number, filters: string) => `기존 질문 ${count}개를 찾았습니다${filters ? ` (${filters})` : ''}.`,
    presets: {
      googleAsync: 'Google async 어려움',
      reactPerformance: 'React 성능',
      closuresBasics: 'Closures 기초',
      systemDesign: 'System design',
      promisePractice: 'Promise 연습',
      domBrowser: 'DOM 브라우저',
      plainIdPrep: 'PlainID 준비',
      algorithms: '알고리즘',
    },
  },
} satisfies Record<Locale, FinderCopy>

function formatFieldName(field: string) {
  if (field === 'companies') return 'company'
  return field
}

function buildAssistantSummary(query: string, result: QuestionFinderResponse, copy: FinderCopy) {
  const count = result.matches?.length ?? 0
  if (count === 0) return copy.noResults(query)

  const filters = [
    result.filters?.difficulty,
    result.filters?.category,
    result.filters?.company,
  ].filter(Boolean)
  return copy.found(count, filters.join(', '))
}

function buildQuestionMatch(question: Question): QuestionFinderMatch {
  return {
    question,
    score: 100,
    matchedFields: [],
    snippet: question.description,
  }
}

export default function QuestionFinderChat({
  onApplySearch,
  onOpenQuestion,
  variant = 'inline',
  applyLabel,
}: QuestionFinderChatProps) {
  const { locale } = useLocale()
  const copy: FinderCopy = finderCopyByLocale[locale]
  const addCopy = { ...defaultAddQuestionCopy, ...copy.add }
  const rtl = isRtlLocale(locale)
  const [open, setOpen] = useState(variant === 'inline')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<FinderMessage[]>([])
  const [matches, setMatches] = useState<QuestionFinderMatch[]>([])
  const [suggestions, setSuggestions] = useState<Question[]>([])
  /** When set, overrides `companies` on save and is sent to suggest/web APIs as a hint. */
  const [addCompany, setAddCompany] = useState('')
  const [addingQuestionIds, setAddingQuestionIds] = useState<Set<string>>(new Set())
  const [lastQuery, setLastQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [webSearching, setWebSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const busy = loading || suggesting || webSearching
  const canSearch = input.trim().length > 0 && !busy
  const nextMessageId = useMemo(
    () => messages.reduce((max, message) => Math.max(max, message.id), 0) + 1,
    [messages],
  )

  async function searchCatalog(rawQuery = input) {
    const query = rawQuery.trim()
    if (!query || busy) return

    setInput('')
    setLoading(true)
    setError(null)
    setLastQuery(query)
    setMessages(prev => [
      ...prev,
      { id: nextMessageId, role: 'user', content: query },
    ])

    try {
      const params = new URLSearchParams({ q: query, limit: '6' })
      const response = await fetch(`/api/questions/search?${params.toString()}`)
      const data = (await response.json().catch(() => null)) as QuestionFinderResponse | null

      if (!response.ok) {
        throw new Error(data?.error ?? copy.fallbackError)
      }

      const nextMatches = Array.isArray(data?.matches) ? data.matches : []
      setMatches(nextMatches)
      setMessages(prev => [
        ...prev,
        {
          id: nextMessageId + 1,
          role: 'assistant',
          content: buildAssistantSummary(query, data ?? {}, copy),
        },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.fallbackError
      setError(message)
      setMatches([])
      setMessages(prev => [
        ...prev,
        { id: nextMessageId + 1, role: 'assistant', content: message },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function suggestQuestions(rawQuery = input) {
    const query = rawQuery.trim()
    if (!query || busy) return

    setInput('')
    setSuggesting(true)
    setError(null)
    setLastQuery(query)
    setMessages(prev => [
      ...prev,
      { id: nextMessageId, role: 'user', content: query },
    ])

    try {
      const response = await fetch('/api/admin/questions/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, count: 3, company: addCompany || undefined }),
      })
      const data = (await response.json().catch(() => null)) as { questions?: Question[]; error?: string } | null

      if (!response.ok) {
        const fallback = response.status === 401 || response.status === 403
          ? addCopy.unauthorized
          : addCopy.suggestFallbackError
        throw new Error(response.status === 401 || response.status === 403 ? fallback : data?.error ?? fallback)
      }

      const nextSuggestions = Array.isArray(data?.questions) ? data.questions : []
      setSuggestions(nextSuggestions)
      setMessages(prev => [
        ...prev,
        {
          id: nextMessageId + 1,
          role: 'assistant',
          content: nextSuggestions.length
            ? addCopy.suggested(nextSuggestions.length)
            : addCopy.noSuggestions(query),
        },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : addCopy.suggestFallbackError
      setError(message)
      setSuggestions([])
      setMessages(prev => [
        ...prev,
        { id: nextMessageId + 1, role: 'assistant', content: message },
      ])
    } finally {
      setSuggesting(false)
    }
  }

  async function webSearchQuestions(rawQuery = input) {
    const query = rawQuery.trim()
    if (!query || busy) return

    setInput('')
    setWebSearching(true)
    setError(null)
    setLastQuery(query)
    setMessages(prev => [
      ...prev,
      { id: nextMessageId, role: 'user', content: query },
    ])

    try {
      const response = await fetch('/api/admin/questions/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, count: 3, company: addCompany || undefined }),
      })
      const data = (await response.json().catch(() => null)) as {
        questions?: Question[]
        note?: string
        error?: string
      } | null

      if (!response.ok) {
        const fallback = response.status === 401 || response.status === 403
          ? addCopy.unauthorized
          : addCopy.suggestFallbackError
        throw new Error(response.status === 401 || response.status === 403 ? fallback : data?.error ?? fallback)
      }

      const nextSuggestions = Array.isArray(data?.questions) ? data.questions : []
      setSuggestions(nextSuggestions)

      const note = typeof data?.note === 'string' && data.note.trim() ? data.note.trim() : ''
      setMessages(prev => [
        ...prev,
        {
          id: nextMessageId + 1,
          role: 'assistant',
          content: nextSuggestions.length
            ? addCopy.webSuggested(nextSuggestions.length)
            : [note, addCopy.webNoResults(query)].filter(Boolean).join(' '),
        },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : addCopy.suggestFallbackError
      setError(message)
      setSuggestions([])
      setMessages(prev => [
        ...prev,
        { id: nextMessageId + 1, role: 'assistant', content: message },
      ])
    } finally {
      setWebSearching(false)
    }
  }

  async function addSuggestedQuestion(question: Question) {
    if (addingQuestionIds.has(question.id)) return

    setError(null)
    setAddingQuestionIds(prev => new Set(prev).add(question.id))

    try {
      const payload: Question = addCompany
        ? { ...question, companies: [addCompany] }
        : question

      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await response.json().catch(() => null)) as { question?: Question; error?: string } | null

      if (!response.ok) {
        const fallback = response.status === 401 || response.status === 403
          ? addCopy.unauthorized
          : addCopy.addFallbackError
        throw new Error(response.status === 401 || response.status === 403 ? fallback : data?.error ?? fallback)
      }

      const createdQuestion = data?.question ?? question
      setSuggestions(prev => prev.filter(item => item.id !== question.id))
      setMatches(prev => [buildQuestionMatch(createdQuestion), ...prev.filter(match => match.question.id !== createdQuestion.id)])
      setMessages(prev => [
        ...prev,
        {
          id: prev.reduce((max, message) => Math.max(max, message.id), 0) + 1,
          role: 'assistant',
          content: addCopy.added(createdQuestion.title),
        },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : addCopy.addFallbackError
      setError(message)
      setMessages(prev => [
        ...prev,
        {
          id: prev.reduce((max, item) => Math.max(max, item.id), 0) + 1,
          role: 'assistant',
          content: message,
        },
      ])
    } finally {
      setAddingQuestionIds(prev => {
        const next = new Set(prev)
        next.delete(question.id)
        return next
      })
    }
  }

  if (variant === 'floating' && !open) {
    return (
      <button
        type="button"
        className="q-finder-chat-fab"
        onClick={() => setOpen(true)}
        aria-label={copy.openAria}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        <MessageCircle size={22} strokeWidth={2} aria-hidden />
        <span>{copy.fab}</span>
      </button>
    )
  }

  return (
    <section
      className={`q-finder-chat${variant === 'floating' ? ' q-finder-chat--floating' : ''}`}
      aria-label="Question finder chatbot"
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <div className="q-finder-chat-head">
        <div>
          <p className="q-finder-chat-kicker">{copy.kicker}</p>
          <h2 className="q-finder-chat-title">{copy.title}</h2>
        </div>
        {variant === 'floating' ? (
          <button
            type="button"
            className="q-finder-chat-close"
            onClick={() => setOpen(false)}
            aria-label={copy.closeAria}
          >
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        ) : (
          <Search className="q-finder-chat-icon" size={22} strokeWidth={2} aria-hidden />
        )}
      </div>

      <div className="q-finder-chat-log" aria-live="polite">
        {messages.length === 0 && (
          <div className="q-chat-bubble q-chat-bubble--assistant">
            <span className="q-chat-role">{copy.finder}</span>
            <div className="q-chat-text">{copy.welcome}</div>
          </div>
        )}
        {messages.map(message => (
          <div key={message.id} className={`q-chat-bubble q-chat-bubble--${message.role}`}>
            <span className="q-chat-role">{message.role === 'user' ? copy.you : copy.finder}</span>
            <div className="q-chat-text">{message.content}</div>
          </div>
        ))}
        {loading && (
          <div className="q-chat-bubble q-chat-bubble--assistant">
            <span className="q-chat-role">{copy.finder}</span>
            <div className="q-chat-text">
              <span className="q-chat-typing">{copy.searching}</span>
            </div>
          </div>
        )}
        {suggesting && (
          <div className="q-chat-bubble q-chat-bubble--assistant">
            <span className="q-chat-role">{copy.finder}</span>
            <div className="q-chat-text">
              <span className="q-chat-typing">{addCopy.suggesting}</span>
            </div>
          </div>
        )}
        {webSearching && (
          <div className="q-chat-bubble q-chat-bubble--assistant">
            <span className="q-chat-role">{copy.finder}</span>
            <div className="q-chat-text">
              <span className="q-chat-typing">{addCopy.webSearching}</span>
            </div>
          </div>
        )}
      </div>

      <form
        className="q-finder-chat-compose"
        onSubmit={(event) => {
          event.preventDefault()
          void searchCatalog()
        }}
      >
        <textarea
          className="q-chat-input"
          rows={2}
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void searchCatalog()
            }
          }}
          placeholder={copy.placeholder}
          disabled={busy}
        />
        <div className="q-finder-chat-actions">
          <button type="submit" className="secondary" disabled={!canSearch}>
            {copy.searchButton}
          </button>
          <button type="button" className="secondary" disabled={!canSearch} onClick={() => void suggestQuestions()}>
            {suggesting ? addCopy.suggesting : addCopy.suggestButton}
          </button>
          <button type="button" className="secondary" disabled={!canSearch} onClick={() => void webSearchQuestions()}>
            {webSearching ? addCopy.webSearching : addCopy.webSearchButton}
          </button>
        </div>
      </form>

      <div className="q-finder-presets">
        <p className="q-finder-presets-label">{copy.presetsLabel}</p>
        <div className="q-finder-chat-examples" aria-label={copy.presetsLabel}>
          {PREDEFINED_SEARCHES.map(search => (
            <button
              key={search.query}
              type="button"
              className="q-finder-example"
              onClick={() => void searchCatalog(search.query)}
              disabled={busy}
              title={search.query}
            >
            {copy.presets[search.key]}
            </button>
          ))}
        </div>
      </div>

      <div className="q-finder-company">
        <label htmlFor="q-finder-company-select" className="q-finder-company-label">
          {addCopy.companyWhenAdding}
        </label>
        <select
          id="q-finder-company-select"
          className="q-finder-company-select"
          value={addCompany}
          onChange={event => setAddCompany(event.target.value)}
          disabled={busy}
        >
          <option value="">—</option>
          {COMPANIES.map(company => (
            <option key={company.id} value={company.id}>
              {company.id}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="q-chat-error">{error}</div>}

      {suggestions.length > 0 && (
        <div className="q-finder-results">
          <div className="q-finder-results-head">
            <p className="q-finder-results-title">{addCopy.suggestedQuestions}</p>
          </div>
          <div className="q-finder-result-list">
            {suggestions.map(question => {
              const isAdding = addingQuestionIds.has(question.id)

              return (
                <article key={question.id} className="q-finder-result-card">
                  <div className="q-finder-result-meta">
                    <span>{question.category}</span>
                    <span>{question.difficulty}</span>
                    {question.companies.slice(0, 2).map(company => (
                      <span key={company}>{company}</span>
                    ))}
                  </div>
                  <h3 className="q-finder-result-title">{question.title}</h3>
                  <p className="q-finder-result-snippet">{question.description}</p>
                  <div className="q-finder-result-foot">
                    <span>{question.answerType}</span>
                    {question.tags.length > 0 && <span>{question.tags.slice(0, 3).join(', ')}</span>}
                  </div>
                  <button
                    type="button"
                    className="q-finder-open-question"
                    onClick={() => void addSuggestedQuestion(question)}
                    disabled={isAdding}
                  >
                    {isAdding ? addCopy.addingQuestion : addCopy.addQuestion}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="q-finder-results">
          <div className="q-finder-results-head">
            <p className="q-finder-results-title">{copy.matchedQuestions}</p>
            {lastQuery && (
              <button type="button" className="q-finder-apply" onClick={() => onApplySearch(lastQuery)}>
                {applyLabel ?? copy.openResultsPage ?? copy.openQuestion}
              </button>
            )}
          </div>
          <div className="q-finder-result-list">
            {matches.map(match => (
              <article key={match.question.id} className="q-finder-result-card">
                <div className="q-finder-result-meta">
                  <span>{match.question.category}</span>
                  <span>{match.question.difficulty}</span>
                  {match.question.companies.slice(0, 2).map(company => (
                    <span key={company}>{company}</span>
                  ))}
                </div>
                <h3 className="q-finder-result-title">{match.question.title}</h3>
                <p className="q-finder-result-snippet">{match.snippet}</p>
                <div className="q-finder-result-foot">
                  <span>{copy.score} {Math.round(match.score)}</span>
                  {match.matchedFields.length > 0 && (
                    <span>
                      {copy.matched} {match.matchedFields.map(formatFieldName).join(', ')}
                    </span>
                  )}
                </div>
                {onOpenQuestion && (
                  <button
                    type="button"
                    className="q-finder-open-question"
                    onClick={() => onOpenQuestion(match.question)}
                  >
                    {copy.openQuestion}
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
