import { useState } from 'react'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }

function area(s: Shape): number {
  if (s.kind === 'circle') {
    return Math.PI * s.radius * s.radius
  }
  return s.width * s.height
}

const IMPL = `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }

function area(s: Shape): number {
  if (s.kind === 'circle') {
    return Math.PI * s.radius * s.radius
  }
  return s.width * s.height
}`

const SHAPES: Shape[] = [
  { kind: 'circle', radius: 4 },
  { kind: 'rect', width: 5, height: 6 },
  { kind: 'circle', radius: 1 },
]

export default function TsDiscriminatedUnionDemo() {
  const [index, setIndex] = useState(0)
  const shape = SHAPES[index]

  return (
    <div className="card">
      <div className="card-title">Discriminated unions</div>
      <p className="card-desc">
        A shared literal field (<code>kind</code>) lets TypeScript narrow the union inside each branch — the same idea as
        Redux actions or HTTP result types.
      </p>

      <div className="controls">
        {SHAPES.map((_, i) => (
          <button key={i} className={i !== index ? 'secondary' : undefined} type="button" onClick={() => setIndex(i)}>
            Shape {i + 1}
          </button>
        ))}
      </div>

      <div className="demo-output">
        <div className="data-field">
          <span className="field-key">kind:</span>
          <span className="field-val">{shape.kind}</span>
        </div>
        {shape.kind === 'circle' ? (
          <div className="data-field">
            <span className="field-key">radius:</span>
            <span className="field-val">{shape.radius}</span>
          </div>
        ) : (
          <>
            <div className="data-field">
              <span className="field-key">width:</span>
              <span className="field-val">{shape.width}</span>
            </div>
            <div className="data-field">
              <span className="field-key">height:</span>
              <span className="field-val">{shape.height}</span>
            </div>
          </>
        )}
        <div className="data-field">
          <span className="field-key">area(shape):</span>
          <span className="field-val">{area(shape).toFixed(3)}</span>
        </div>
      </div>

      <CollapsibleCode label="implementation" code={IMPL} language="typescript">
        <Explanation
          steps={[
            { text: <>The <code>kind</code> field is the discriminant; checking it narrows <code>s</code>.</> },
            { text: <>After <code>kind === &apos;circle&apos;</code>, only circle fields exist on <code>s</code>.</> },
            { text: <>In the <code>else</code> branch, TypeScript knows <code>s</code> is the rectangle variant.</> },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}
