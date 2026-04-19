import { useState } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

type Method = {
  id: string
  label: string
  description: string
  parentClass: string
  childClass: string
  css: string
  steps: string[]
}

const METHODS: Method[] = [
  {
    id: 'absolute-transform',
    label: 'Absolute + transform',
    description:
      'Pin the child to the parent center, then pull it back by half its own size. Works without knowing the child width or height.',
    parentClass: 'css-center-stage css-center-stage--rel',
    childClass: 'css-center-child css-center-child--abs-transform',
    css: `.parent {
  position: relative;
}
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}`,
    steps: [
      '`position: relative` on the parent makes it the containing block.',
      '`top: 50%` / `left: 50%` place the child’s top-left corner at the parent center.',
      '`translate(-50%, -50%)` shifts the child back by half its own width and height.',
      'The child does not need a fixed size — it self-centers.',
    ],
  },
  {
    id: 'absolute-margin-auto',
    label: 'Absolute + margin: auto',
    description:
      'Stretch the child between all four edges (`inset: 0`), then let `margin: auto` distribute the leftover space equally — needs an explicit width and height.',
    parentClass: 'css-center-stage css-center-stage--rel',
    childClass: 'css-center-child css-center-child--abs-margin',
    css: `.parent {
  position: relative;
}
.child {
  position: absolute;
  inset: 0;            /* top/right/bottom/left: 0 */
  width: 120px;
  height: 60px;
  margin: auto;        /* spreads remaining space evenly */
}`,
    steps: [
      '`inset: 0` shorthand sets top, right, bottom, left to 0.',
      'A fixed `width` and `height` leave free space inside the parent.',
      '`margin: auto` divides that free space equally on all four sides.',
      'The child lands in the exact center, both horizontally and vertically.',
    ],
  },
  {
    id: 'margin-auto',
    label: 'margin: 0 auto (horizontal only)',
    description:
      'The classic horizontal centerer for block elements with a known width. It does nothing vertically — the child sits at the natural top of the parent.',
    parentClass: 'css-center-stage',
    childClass: 'css-center-child css-center-child--margin-auto',
    css: `.child {
  display: block;
  width: 140px;
  margin: 0 auto;
}`,
    steps: [
      'Block elements default to filling the parent width.',
      'Setting an explicit `width` smaller than the parent leaves leftover horizontal space.',
      '`margin: 0 auto` makes the browser split that leftover space equally left and right.',
      'No vertical centering — combine with another technique if you need that too.',
    ],
  },
  {
    id: 'table-cell',
    label: 'display: table-cell',
    description:
      'Pre-flexbox classic. The parent behaves like a table cell, so `text-align` and `vertical-align` align inline children both horizontally and vertically.',
    parentClass: 'css-center-stage css-center-stage--table',
    childClass: 'css-center-child css-center-child--inline-block',
    css: `.parent {
  display: table-cell;
  text-align: center;     /* horizontal: aligns inline content */
  vertical-align: middle; /* vertical: only works on table-cell */
}
.child {
  display: inline-block;
}`,
    steps: [
      '`display: table-cell` makes the parent behave like a single table cell.',
      '`vertical-align: middle` is special — it actually centers content inside table cells.',
      '`text-align: center` centers any inline-level child horizontally.',
      'The child must be inline-level (`inline` or `inline-block`) for these properties to apply.',
    ],
  },
]

export default function CenterDivCard() {
  const [methodId, setMethodId] = useState<Method['id']>(METHODS[0].id)
  const method = METHODS.find(m => m.id === methodId) ?? METHODS[0]

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">Center a div without flex or grid</div>
          <p className="card-desc">
            Four classic ways to center a child inside a parent box — useful when an interviewer
            asks you to center <em>without</em> reaching for <code>display: flex</code> or
            <code> display: grid</code>.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>◎</span>
      </div>

      <div className="controls css-center-controls" role="tablist" aria-label="Centering technique">
        {METHODS.map(m => {
          const active = m.id === method.id
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`secondary css-center-tab${active ? ' active' : ''}`}
              onClick={() => setMethodId(m.id)}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      <p className="card-desc css-center-method-desc">{method.description}</p>

      <div className={method.parentClass} aria-label="Live preview">
        <div className={method.childClass}>centered</div>
      </div>

      <CodeBlock code={method.css} language="css" />

      <CollapsibleCode label="how it works" code={method.css} language="css">
        <Explanation steps={method.steps.map(text => ({ text: <>{text}</> }))} />
      </CollapsibleCode>
    </div>
  )
}
