import type { SandpackFiles } from '@codesandbox/sandpack-react'
import FrameworkSandpackCard from '../components/FrameworkSandpackCard'

const VUE_TS_FILES = {
  '/src/App.vue': {
    code: `<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(count, (v, prev) => {
  // Runs after count changes — interview talking point for vs watchEffect
  console.log('count:', prev, '→', v)
})
</script>

<template>
  <div class="vue-lesson">
    <h4>Composition API</h4>
    <p>
      <button type="button" @click="count++">Increment</button>
      <button type="button" class="secondary" @click="count = 0">Reset</button>
    </p>
    <p><strong>count:</strong> {{ count }}</p>
    <p><strong>doubled (computed):</strong> {{ doubled }}</p>
  </div>
</template>

<style scoped>
.vue-lesson {
  font-family: system-ui, sans-serif;
  padding: 0.75rem 1rem;
}
button {
  margin-right: 0.5rem;
  margin-bottom: 0.35rem;
}
h4 {
  margin: 0 0 0.5rem;
}
</style>
`,
  },
} satisfies SandpackFiles

export default function VueCompositionPlayground() {
  return (
    <FrameworkSandpackCard
      template="vue-ts"
      title="Vue 3 + TypeScript"
      description="Live SFC with script setup: ref, computed, and watch. Open the browser console to see watch logs."
      files={VUE_TS_FILES}
      visibleFiles={['/src/App.vue']}
      activeFile="/src/App.vue"
      editorMinHeight={340}
      fallbackCode={VUE_TS_FILES['/src/App.vue'].code}
      fallbackLanguage="plaintext"
    />
  )
}
