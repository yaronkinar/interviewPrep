import ChatReactPreview from './questions/ChatReactPreview'
import { useLocale } from './i18n/LocaleContext'
import { getUiStrings } from './i18n/uiStrings'

export default function ReactSandboxPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <>
      <h1 className="page-title">{ui.pages.sandboxTitle}</h1>
      <p className="sandbox-page-lead">{ui.pages.sandboxLead}</p>
      <div className="sandbox-page-body">
        <ChatReactPreview />
      </div>
    </>
  )
}
