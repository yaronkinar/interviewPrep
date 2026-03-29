import * as Babel from '@babel/standalone'
import typescriptPreset from '@babel/preset-typescript'

let typescriptPresetRegistered = false

function ensureTypescriptPreset(): void {
  if (typescriptPresetRegistered) return
  Babel.registerPreset('typescript', typescriptPreset as Parameters<typeof Babel.registerPreset>[1])
  typescriptPresetRegistered = true
}

function stripModuleSyntax(code: string): string {
  const lines = code.split('\n').filter((line) => !/^\s*import\s+/.test(line))
  let s = lines.join('\n')
  s = s.replace(/export\s+default\s+function/g, 'function')
  s = s.replace(/export\s+default\s+/g, '')
  s = s.replace(/export\s+function/g, 'function')
  s = s.replace(/export\s+const/g, 'const')
  s = s.replace(/export\s*\{[^}]*\}\s*;?/gm, '')
  return s.trim()
}

function wrapForPreview(userCode: string): string {
  const body = stripModuleSyntax(userCode)
  const hooks = `const { useState, useEffect, useMemo, useCallback, useRef, useId, Fragment } = React;`
  return `${hooks}

${body}

const __r = document.getElementById('root');
const __root = ReactDOM.createRoot(__r);
const __C = typeof App !== 'undefined' ? App : typeof Preview !== 'undefined' ? Preview : typeof Demo !== 'undefined' ? Demo : null;
if (__C) {
  __root.render(React.createElement(__C));
} else {
  __root.render(React.createElement('pre', { style: { color: '#f87171', padding: 12, fontSize: 12, margin: 0 } }, 'Define a function component named App, Preview, or Demo.'));
}
`
}

const REACT_UMD = 'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js'
const REACT_DOM_UMD = 'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js'

function makeIframeHtml(compiledJs: string): string {
  const safe = compiledJs.replace(/<\/script/gi, '<\\/script')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<script crossorigin src="${REACT_UMD}"></script>
<script crossorigin src="${REACT_DOM_UMD}"></script>
<style>
*{box-sizing:border-box}
html,body,#root{min-height:140px;margin:0}
body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0f1118;color:#e2e8f0;font-size:14px;line-height:1.45}
</style>
</head><body><div id="root"></div>
<script>
window.onerror=function(msg,src,line,col,err){
  var el=document.getElementById('root');
  var t=(err&&err.stack)||msg||'Runtime error';
  if(el) el.innerHTML='<pre style="color:#f87171;padding:10px;font:12px/1.4 monospace;white-space:pre-wrap;margin:0">'+String(t)+'</pre>';
  return true;
};
</script>
<script>${safe}</script>
</body></html>`
}

export async function compileAndBuildPreviewHtml(userCode: string): Promise<{ html: string } | { error: string }> {
  ensureTypescriptPreset()
  const wrapped = wrapForPreview(userCode)
  try {
    const result = Babel.transform(wrapped, {
      filename: 'preview.tsx',
      presets: [
        ['typescript', { isTSX: true, allExtensions: true }],
        'react',
      ],
    })
    const code = result?.code
    if (!code) return { error: 'Babel produced no output.' }
    return { html: makeIframeHtml(code) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

export function objectUrlFromHtml(html: string): string {
  return URL.createObjectURL(new Blob([html], { type: 'text/html' }))
}
