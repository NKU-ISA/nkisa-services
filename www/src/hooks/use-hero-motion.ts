import { createContext, useContext, useSyncExternalStore } from 'react'

export const MotionEnabledContext = createContext(true)

const motionQuery = '(prefers-reduced-motion: no-preference)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(motionQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function getSnapshot() {
  return window.matchMedia(motionQuery).matches
}

function getServerSnapshot() {
  return false
}

export function useHeroMotion() {
  const enabled = useContext(MotionEnabledContext)
  const preferred = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return enabled && preferred
}
