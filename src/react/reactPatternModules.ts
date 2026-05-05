import type { LearningPathDifficulty, LearningPathModuleMeta, LearningPathStatus } from '../components/stitch/learningPathTypes'
import {
  BookOpen,
  CircleDot,
  Globe2,
  Images,
  ListOrdered,
  PanelBottomOpen,
  Share2,
  Timer,
} from 'lucide-react'

export type PatternDifficulty = LearningPathDifficulty
export type PatternStatus = LearningPathStatus
export type ReactPatternModuleMeta = LearningPathModuleMeta

export const REACT_PATTERN_MODULES: LearningPathModuleMeta[] = [
  {
    id: 'cheatsheet',
    difficulty: 'easy',
    status: 'not_started',
    progress: 0,
    title: 'React cheatsheet',
    description:
      'Quick reference for JSX, hooks, and common interview topics — pairs with the interactive demos below.',
    Icon: BookOpen,
  },
  {
    id: 'useFetch',
    difficulty: 'medium',
    status: 'in_progress',
    progress: 45,
    title: 'useFetch',
    description:
      'Custom hook pattern for fetching JSON with loading and error states, cancellation-safe updates.',
    Icon: Globe2,
  },
  {
    id: 'useDebounce',
    difficulty: 'easy',
    status: 'mastered',
    progress: 100,
    title: 'useDebounce',
    description:
      'Delays updating a value until input is stable — avoids noisy API calls on every keystroke.',
    Icon: Timer,
  },
  {
    id: 'useCallback',
    difficulty: 'medium',
    status: 'mastered',
    progress: 100,
    title: 'useCallback + memo',
    description:
      'Memoizes function references so memoized children skip needless re-renders when deps are unchanged.',
    Icon: Share2,
  },
  {
    id: 'useRef',
    difficulty: 'medium',
    status: 'in_progress',
    progress: 55,
    title: 'useRef',
    description:
      'Mutable refs across renders — timers, DOM nodes, and tracking values without triggering re-renders.',
    Icon: CircleDot,
  },
  {
    id: 'lazyThrottle',
    difficulty: 'hard',
    status: 'not_started',
    progress: 0,
    title: 'Lazy loading + throttle',
    description:
      'Images load near the viewport; scroll handlers are throttled to reduce expensive layout reads.',
    Icon: Images,
  },
  {
    id: 'eventLoop',
    difficulty: 'hard',
    status: 'in_progress',
    progress: 25,
    title: 'Event loop order',
    description:
      'Execution order between synchronous code, microtasks (promises), and macrotasks (timeouts).',
    Icon: ListOrdered,
  },
  {
    id: 'dropdownPortal',
    difficulty: 'medium',
    status: 'not_started',
    progress: 0,
    title: 'Dropdown + portals',
    description:
      'Positions menus from viewport space and escapes overflow clipping via createPortal.',
    Icon: PanelBottomOpen,
  },
]
