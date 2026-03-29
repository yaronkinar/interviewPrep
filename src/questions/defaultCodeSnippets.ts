/** Default React preview sample (sandbox). */
export const DEFAULT_REACT_PREVIEW_SNIPPET = `function App() {
  const [n, setN] = useState(0)
  return (
    <div style={{ padding: 12 }}>
      <p>Preview runs in an isolated iframe (React 18 UMD).</p>
      <button type="button" onClick={() => setN((x) => x + 1)}>
        Count: {n}
      </button>
    </div>
  )
}
`
