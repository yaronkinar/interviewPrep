import {
  Braces,
  Droplets,
  FileCode,
  Layers,
  Puzzle,
  Zap,
} from 'lucide-react'

const iconProps = { size: 16, strokeWidth: 2, className: 'react-cheatsheet-svg' } as const

export default function AngularCheatsheet() {
  return (
    <div className="card react-cheatsheet-card">
      <header className="react-cheatsheet-header">
        <div className="card-title">Angular cheatsheet</div>
        <p className="card-desc react-cheatsheet-lead">
          Modules, DI, templates, and change detection — staples in Angular-focused interviews.
        </p>
      </header>

      <div className="react-cheatsheet-columns">
        <section className="react-cheatsheet-section" aria-labelledby="ng-mod">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Layers {...iconProps} />
            </span>
            <h3 id="ng-mod">NgModule vs standalone</h3>
          </div>
          <ul>
            <li>
              Traditional apps compose <code>@NgModule</code> declarations, imports, providers, and bootstrap.
            </li>
            <li>
              Standalone components reduce module ceremony — know migration story and when libraries still expose modules.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="ng-di">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Puzzle {...iconProps} />
            </span>
            <h3 id="ng-di">Dependency injection</h3>
          </div>
          <ul>
            <li>
              Constructor injection for services; hierarchical injectors (root, module, component).
            </li>
            <li>
              <code>providedIn: 'root'</code> for singletons vs explicit <code>providers</code> arrays.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="ng-tpl">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <FileCode {...iconProps} />
            </span>
            <h3 id="ng-tpl">Templates</h3>
          </div>
          <ul>
            <li>
              Interpolation <code>{'{{ expr }}'}</code>, property binding <code>[prop]</code>, events <code>(evt)</code>,
              two-way <code>[(ngModel)]</code> (FormsModule).
            </li>
            <li>
              Structural directives <code>*ngIf</code>, <code>*ngFor</code>; trackBy for list performance.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="ng-rx">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Braces {...iconProps} />
            </span>
            <h3 id="ng-rx">RxJS</h3>
          </div>
          <ul>
            <li>
              Observables with <code>async</code> pipe vs manual subscribe — unsubscribe patterns (takeUntil, async pipe).
            </li>
            <li>
              Common ops: <code>map</code>, <code>switchMap</code>, <code>catchError</code>, <code>shareReplay</code>.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="ng-cd">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Droplets {...iconProps} />
            </span>
            <h3 id="ng-cd">Change detection</h3>
          </div>
          <ul>
            <li>
              Default zone.js triggers CD broadly; <code>ChangeDetectionStrategy.OnPush</code> for performance (immutable inputs).
            </li>
            <li>
              <code>markForCheck</code> / <code>detectChanges</code> when integrating non-zone async APIs.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section react-cheatsheet-section--caution" aria-labelledby="ng-pitfalls">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Zap {...iconProps} />
            </span>
            <h3 id="ng-pitfalls">Senior topics</h3>
          </div>
          <ul>
            <li>Lazy-loaded feature modules vs route-level code splitting with standalone routes.</li>
            <li>Guards, resolvers, and interceptors — where logic belongs in the HTTP pipeline.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
