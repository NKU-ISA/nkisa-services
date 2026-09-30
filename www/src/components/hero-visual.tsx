import { useEffect, useRef } from 'react'
import { useInView } from 'motion/react'

import logo from '@/assets/brand/nkisa-logo-white.svg'
import { useHeroMotion } from '@/hooks/use-hero-motion'

import './hero-visual.css'

const TAU = Math.PI * 2
const ORBIT_COLOR = '216, 154, 205'
const SEGMENTS = 96

type Point3 = readonly [number, number, number]
type Projected = { x: number; y: number; depth: number }

// Geometry is created once. The animation only rotates and projects these points.
const meridians: Point3[][] = Array.from({ length: 28 }, (_, line) => (
  Array.from({ length: SEGMENTS + 1 }, (_, step) => {
    const longitude = (line / 28) * TAU
    const latitude = (step / SEGMENTS) * Math.PI
    return [Math.sin(latitude) * Math.cos(longitude), Math.cos(latitude), Math.sin(latitude) * Math.sin(longitude)] as const
  })
))
const parallels: Point3[][] = Array.from({ length: 19 }, (_, line) => (
  Array.from({ length: SEGMENTS + 1 }, (_, step) => {
    const latitude = ((line + 1) / 20) * Math.PI
    const longitude = (step / SEGMENTS) * TAU
    return [Math.sin(latitude) * Math.cos(longitude), Math.cos(latitude), Math.sin(latitude) * Math.sin(longitude)] as const
  })
))
const sphereLines = [...meridians, ...parallels]
const orbitSettings = [
  { radius: 1.29, tilt: 0.48, rotate: -0.5, speed: 0.16, phase: 0.8 },
  { radius: 1.17, tilt: 1.05, rotate: 0.65, speed: -0.1, phase: 3.6 },
  { radius: 1.38, tilt: 0.21, rotate: -0.72, speed: 0.08, phase: 4.4 },
]

function orbitPoint(angle: number, radius: number, tilt: number, rotation: number): Point3 {
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius * Math.sin(tilt)
  const z = Math.sin(angle) * radius * Math.cos(tilt)
  return [x * Math.cos(rotation) - y * Math.sin(rotation), x * Math.sin(rotation) + y * Math.cos(rotation), z]
}

export function HeroVisual({ ambientPaused = false, replayKey = 0 }: {
  ambientPaused?: boolean
  replayKey?: number
}) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const time = useRef(0)
  const previousReplay = useRef(replayKey)
  const motionEnabled = useHeroMotion()
  const inView = useInView(root, { amount: 0.05 })
  const ambientEnabled = motionEnabled && !ambientPaused && inView

  useEffect(() => {
    const element = root.current
    const surface = canvas.current
    const context = surface?.getContext('2d', { alpha: true })
    if (!element || !surface || !context) return

    if (previousReplay.current !== replayKey) {
      previousReplay.current = replayKey
      time.current = 0
    }

    let frame = 0
    let lastFrame = 0
    let width = 0
    let height = 0
    let pointerX = 0
    let pointerY = 0
    let currentX = 0
    let currentY = 0
    let disposed = false
    const pointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)')

    const draw = () => {
      if (!width || !height) return
      context.clearRect(0, 0, width, height)
      const radius = Math.min(width, height) * 0.323
      const centerX = width * 0.5
      const centerY = height * 0.49
      const rotationY = time.current * 0.065 + 0.25 + currentX * 0.14
      const rotationX = -0.34 + currentY * 0.1
      const rotationZ = -0.29
      const cosY = Math.cos(rotationY)
      const sinY = Math.sin(rotationY)
      const cosX = Math.cos(rotationX)
      const sinX = Math.sin(rotationX)
      const cosZ = Math.cos(rotationZ)
      const sinZ = Math.sin(rotationZ)

      const project = ([px, py, pz]: Point3, rotate = true): Projected => {
        const x = rotate ? px * cosY + pz * sinY : px
        const z = rotate ? -px * sinY + pz * cosY : pz
        const y = py * cosX - z * sinX
        const depth = py * sinX + z * cosX
        const perspective = 4.6 / (4.6 - depth)
        return {
          x: centerX + (x * cosZ - y * sinZ) * radius * perspective,
          y: centerY + (x * sinZ + y * cosZ) * radius * perspective,
          depth,
        }
      }

      const glow = context.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.4)
      glow.addColorStop(0, `rgba(${ORBIT_COLOR}, 0)`)
      glow.addColorStop(0.55, `rgba(${ORBIT_COLOR}, 0.035)`)
      glow.addColorStop(1, `rgba(${ORBIT_COLOR}, 0)`)
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      // Separate the far and near hemispheres to keep a clear sense of volume.
      const projectedLines = sphereLines.map((line) => line.map((point) => project(point)))
      for (const front of [false, true]) {
        context.beginPath()
        for (const line of projectedLines) {
          let penDown = false
          for (const point of line) {
            if ((point.depth > 0) === front) {
              if (penDown) context.lineTo(point.x, point.y)
              else context.moveTo(point.x, point.y)
              penDown = true
            } else {
              if (penDown) context.lineTo(point.x, point.y)
              penDown = false
            }
          }
        }
        context.strokeStyle = `rgba(${ORBIT_COLOR}, ${front ? 0.46 : 0.12})`
        context.lineWidth = front ? 0.65 : 0.55
        context.stroke()
      }

      for (const [index, orbit] of orbitSettings.entries()) {
        context.beginPath()
        for (let step = 0; step <= 160; step++) {
          const point = project(orbitPoint((step / 160) * TAU, orbit.radius, orbit.tilt, orbit.rotate), false)
          if (step === 0) context.moveTo(point.x, point.y)
          else context.lineTo(point.x, point.y)
        }
        context.strokeStyle = index === 0 ? `rgba(${ORBIT_COLOR}, 0.56)` : `rgba(${ORBIT_COLOR}, 0.19)`
        context.lineWidth = index === 0 ? 0.85 : 0.6
        context.stroke()

        const angle = time.current * orbit.speed + orbit.phase
        const particle = project(orbitPoint(angle, orbit.radius, orbit.tilt, orbit.rotate), false)
        const particleGlow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 12)
        particleGlow.addColorStop(0, `rgba(${ORBIT_COLOR}, 0.65)`)
        particleGlow.addColorStop(0.25, `rgba(${ORBIT_COLOR}, 0.2)`)
        particleGlow.addColorStop(1, `rgba(${ORBIT_COLOR}, 0)`)
        context.fillStyle = particleGlow
        context.beginPath()
        context.arc(particle.x, particle.y, 12, 0, TAU)
        context.fill()
        context.fillStyle = index === 0 ? '#fff0fb' : '#d89acd'
        context.beginPath()
        context.arc(particle.x, particle.y, index === 0 ? 2.5 : 1.8, 0, TAU)
        context.fill()
      }

      // Sparse points follow the same projected surface as the wireframe.
      for (let index = 0; index < 12; index++) {
        const line = meridians[(index * 7) % meridians.length]
        const point = project(line[13 + (index * 13) % 68])
        if (point.depth < 0.15) continue
        context.fillStyle = `rgba(${ORBIT_COLOR}, ${0.42 + Math.sin(time.current * 0.7 + index) * 0.2})`
        context.beginPath()
        context.arc(point.x, point.y, 1.4, 0, TAU)
        context.fill()
      }

      element.style.setProperty('--hero-visual-pointer-x', `${currentX * 7}px`)
      element.style.setProperty('--hero-visual-pointer-y', `${currentY * 7}px`)
    }

    const tick = (now: number) => {
      if (disposed || !ambientEnabled || document.hidden) return
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0
      lastFrame = now
      time.current += delta
      currentX += (pointerX - currentX) * Math.min(1, delta * 4)
      currentY += (pointerY - currentY) * Math.min(1, delta * 4)
      draw()
      frame = requestAnimationFrame(tick)
    }

    const resize = () => {
      const bounds = element.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      surface.width = Math.round(width * dpr)
      surface.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }
    const visibility = () => {
      cancelAnimationFrame(frame)
      lastFrame = 0
      element.dataset.visible = document.hidden ? 'false' : 'true'
      if (!document.hidden && ambientEnabled) frame = requestAnimationFrame(tick)
    }
    const move = (event: PointerEvent) => {
      if (!ambientEnabled || !pointerMedia.matches || event.pointerType === 'touch') return
      const bounds = element.getBoundingClientRect()
      const localX = (event.clientX - bounds.left) / bounds.width
      const localY = (event.clientY - bounds.top) / bounds.height
      const isInside = localX >= 0 && localX <= 1 && localY >= 0 && localY <= 1
      pointerX = isInside ? localX * 2 - 1 : 0
      pointerY = isInside ? localY * 2 - 1 : 0
    }
    const resetPointer = () => {
      pointerX = 0
      pointerY = 0
    }

    const observer = new ResizeObserver(resize)
    observer.observe(element)
    resize()
    visibility()
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', resetPointer)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', resetPointer)
    }
  }, [ambientEnabled, replayKey])

  return (
    <div
      ref={root}
      className="hero-visual"
      aria-hidden="true"
      data-motion={motionEnabled ? 'on' : 'off'}
      data-ambient={ambientEnabled ? 'running' : 'paused'}
    >
      <div className="hero-visual__atmosphere" />
      <svg className="hero-visual__reticle" viewBox="0 0 600 600" fill="none">
        <circle cx="300" cy="294" r="252" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 12" />
        <path d="M300 28v12M300 548v12M34 294h12M554 294h12" stroke="currentColor" />
        <path d="M110 106h26M110 106v26M466 106h26M492 106v26M110 480h26M110 454v26M466 480h26M492 454v26" stroke="currentColor" strokeOpacity="0.55" />
        <path d="M38 400h70l30-30M462 190l30-30h70" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.7" />
        <circle cx="138" cy="370" r="2.5" fill="currentColor" fillOpacity="0.5" />
        <circle cx="462" cy="190" r="2.5" fill="currentColor" fillOpacity="0.5" />
      </svg>
      <canvas ref={canvas} className="hero-visual__canvas" />
      <div className="hero-visual__core">
        <div key={replayKey} className="hero-visual__identity">
          <img src={logo} width="1000" height="1000" alt="" draggable={false} />
        </div>
      </div>
      <span className="hero-visual__annotation hero-visual__annotation--top">NKISA / SECURITY CORE</span>
      <span className="hero-visual__annotation hero-visual__annotation--left"><i /> SYSTEM ONLINE<span>39°06′ N · 117°10′ E</span></span>
      <span className="hero-visual__annotation hero-visual__annotation--right">EXPLORE THE UNKNOWN<span>0x4E 0x4B 0x49 0x53 0x41</span></span>
      <span className="hero-visual__annotation hero-visual__annotation--bottom">[ OPEN MIND. SECURE WORLD. ]</span>
    </div>
  )
}
