'use client'

import { useJsSandboxUseSandpack } from '@/hooks/useJsSandboxUseSandpack'
import SandboxMonaco from './SandboxMonaco'
import SandboxSandpack from './SandboxSandpack'

export default function Sandbox() {
  const useSandpack = useJsSandboxUseSandpack()

  if (useSandpack === null) {
    return (
      <div
        className="card sandbox-wrap"
        style={{ marginTop: 0, minHeight: '14rem', opacity: 0.65 }}
        aria-busy="true"
        aria-label="Loading sandbox"
      />
    )
  }

  return useSandpack ? <SandboxSandpack /> : <SandboxMonaco />
}
