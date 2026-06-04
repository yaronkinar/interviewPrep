import { Cable, Database, GlobeLock, Rocket, Waypoints } from 'lucide-react'

const iconProps = { size: 16, strokeWidth: 2, className: 'react-cheatsheet-svg' } as const

export default function FullStackTopics() {
  return (
    <div className="card react-cheatsheet-card">
      <header className="react-cheatsheet-header">
        <div className="card-title">Interview breadth checklist</div>
        <p className="card-desc react-cheatsheet-lead">
          Questions labeled Full Stack on Company Q&amp;A span backend-facing themes alongside UI work — rehearse how you connect each layer when you trace a request end to end.
        </p>
      </header>

      <div className="react-cheatsheet-columns">
        <section className="react-cheatsheet-section" aria-labelledby="fs-api">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Cable {...iconProps} />
            </span>
            <h3 id="fs-api">APIs &amp; contracts</h3>
          </div>
          <ul>
            <li>
              REST resource modeling, status codes, idempotency for <code>POST</code>/<code>PUT</code>, pagination, and versioning.
            </li>
            <li>
              GraphQL vs REST trade-offs: N+1, schema evolution, persisted queries, and when batching helps.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="fs-data">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Database {...iconProps} />
            </span>
            <h3 id="fs-data">Persistence</h3>
          </div>
          <ul>
            <li>
              Transactions, isolation levels, indexes that match real queries, and migration discipline across environments.
            </li>
            <li>
              SQL vs document stores — normalization vs embedding; caches (TTL, stampede, invalidate-after-write).
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="fs-auth">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <GlobeLock {...iconProps} />
            </span>
            <h3 id="fs-auth">Auth &amp; browser boundaries</h3>
          </div>
          <ul>
            <li>
              Sessions vs JWT claims vs OAuth flows — cookie attributes (<code>HttpOnly</code>, <code>SameSite</code>), rotation, CSRF posture for cookie APIs.
            </li>
            <li>
              CORS preflight when browsers hit distinct origins — avoid casually weakening origins or wildcard credentials.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="fs-runtime">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Rocket {...iconProps} />
            </span>
            <h3 id="fs-runtime">Runtime &amp; delivery</h3>
          </div>
          <ul>
            <li>
              Env config per stage (secrets vs flags), container/host assumptions, graceful shutdown, structured logs &amp; trace IDs across tiers.
            </li>
            <li>
              CI/CD gates — migrations ordering, smoke checks, blue/green or staged rollout vocabulary you can defend.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="fs-arch">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Waypoints {...iconProps} />
            </span>
            <h3 id="fs-arch">Product-shaped architecture</h3>
          </div>
          <ul>
            <li>
              When a modular monolith is enough vs extracting services — coupling markers such as schema ownership and deployment blast radius.
            </li>
            <li>
              Background jobs, outboxes or eventual consistency stories clients observe — pairing nicely with System Design cards elsewhere on the site.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
