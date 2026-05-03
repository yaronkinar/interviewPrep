import type { SandpackFiles } from '@codesandbox/sandpack-react'
import FrameworkSandpackCard from '../components/FrameworkSandpackCard'

const ANGULAR_FILES = {
  '/src/app/app.component.ts': {
    code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  count = 0;
  message = 'Angular component';

  increment(): void {
    this.count++;
  }

  reset(): void {
    this.count = 0;
  }
}
`,
  },
  '/src/app/app.component.html': {
    code: `<div class="wrap">
  <h4>{{ message }}</h4>
  <p>
    <button type="button" (click)="increment()">+1</button>
    <button type="button" class="secondary" (click)="reset()">Reset</button>
  </p>
  <p><strong>count:</strong> {{ count }}</p>
</div>
`,
  },
  '/src/app/app.component.css': {
    code: `.wrap {
  font-family: system-ui, sans-serif;
  padding: 0.75rem 1rem;
}
button {
  margin-right: 0.5rem;
}
h4 {
  margin: 0 0 0.5rem;
}
`,
  },
} satisfies SandpackFiles

const ANGULAR_MONACO_FALLBACK = `${ANGULAR_FILES['/src/app/app.component.ts'].code.trim()}
/* ─── app.component.html ─── */
${ANGULAR_FILES['/src/app/app.component.html'].code.trim()}
`

export default function AngularPlayground() {
  return (
    <FrameworkSandpackCard
      template="angular"
      title="Angular component"
      description="Classic NgModule starter: edit the component class and template — bindings use the same mental model as interview whiteboards."
      files={ANGULAR_FILES}
      visibleFiles={['/src/app/app.component.ts', '/src/app/app.component.html']}
      activeFile="/src/app/app.component.ts"
      editorMinHeight={320}
      fallbackCode={ANGULAR_MONACO_FALLBACK}
      fallbackLanguage="plaintext"
    />
  )
}
