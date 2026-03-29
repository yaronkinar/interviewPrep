import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getInitialLocale,
  LOCALE_STORAGE_KEY,
  normalizeToSupported,
  SUPPORTED_LOCALES,
  writeStoredLocale,
  type Locale,
} from './locale'
import { getStrings, type AppStrings } from './strings'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  strings: AppStrings
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function applyDocumentLocale(locale: Locale): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale())

  useLayoutEffect(() => {
    applyDocumentLocale(locale)
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    const resolved = normalizeToSupported(next)
    setLocaleState(resolved)
    writeStoredLocale(resolved)
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      strings: getStrings(locale),
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}

export { SUPPORTED_LOCALES }
