import ChatReactPreview from './questions/ChatReactPreview'

export default function ReactSandboxPage() {
  return (
    <>
      <h1 className="page-title">React sandbox</h1>
      <p className="sandbox-page-lead">
        Edit in a VS Code–style editor (Monaco, dark theme), compile TSX in the browser, and preview in an isolated iframe.
        Paste a full Claude reply from <strong>Company Q&amp;A</strong> to extract code, or type directly in{' '}
        <strong>Preview.tsx</strong>.
      </p>
      <div className="sandbox-page-body">
        <ChatReactPreview />
      </div>
    </>
  )
}
