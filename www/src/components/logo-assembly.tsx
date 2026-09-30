import { useCallback, useEffect, useId, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

import { nkisaLogoGroups } from '@/assets/brand/nkisa-logo-paths'
import { nkisaTriangles } from '@/assets/brand/nkisa-logo-geometry'

const sweepEase = [0.42, 0, 0.32, 1] as const

// The three sectors meet at (503, 500). Their normals correspond to the
// horizontal and ±60° edges of the mark. A one-unit overlap avoids dark seams.
const scanPasses = [
  { id: 'top', sector: '0,0 1000,0 1000,214.06 503,501 0,210.59', angle: 90, from: -510, delay: 0.2, duration: 2.1 },
  { id: 'left', sector: '0,208.59 504,499 504,1000 0,1000', angle: -30, from: -340, delay: 0.6, duration: 2.45 },
  { id: 'right', sector: '502,499 1000,212.06 1000,1000 502,1000', angle: 210, from: -360, delay: 1, duration: 2.65 },
] as const

type ScanPass = typeof scanPasses[number]

function ScanReveal({ pass, uid, onComplete }: {
  pass: ScanPass
  uid: string
  onComplete?: () => void
}) {
  const front = useMotionValue<number>(pass.from)
  const revealWidth = useTransform(front, (position) => position + 1500)
  const beamOpacity = useTransform(front,
    [pass.from, pass.from + 24, -30, 8], [0, 0.95, 0.85, 0])
  const localTransform = `translate(503 500) rotate(${pass.angle})`
  const sectorId = `${uid}-${pass.id}-sector`
  const maskId = `${uid}-${pass.id}-reveal`

  useEffect(() => {
    // One value drives the mask's leading edge and the light itself: the logo
    // is revealed exactly where the line passes, with no independent fade-in.
    const playback = animate(front, 8, {
      delay: pass.delay,
      duration: pass.duration,
      ease: sweepEase,
      onComplete,
    })
    return () => playback.stop()
  }, [front, pass, onComplete])

  return (
    <g className="hero-visual__scan-pass" data-scan={pass.id}>
      <defs>
        <clipPath id={sectorId}><polygon points={pass.sector} /></clipPath>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000" style={{ maskType: 'luminance' }}>
          <g transform={localTransform}>
            <motion.rect
              className="hero-visual__reveal-front"
              x="-1500" y="-1500" height="3000"
              width={revealWidth}
              fill="white"
            />
          </g>
        </mask>
      </defs>
      <g clipPath={`url(#${sectorId})`}>
        <use href={`#${uid}-original`} mask={`url(#${maskId})`} fill="white" />
        <g transform={localTransform}>
          <motion.g
            className="hero-visual__scan-line"
            style={{ x: front, opacity: beamOpacity }}
          >
            <path d="M0 -1500 V1500" stroke="#bd8ec2" strokeWidth="10" filter={`url(#${uid}-scan-glow)`} />
            <path d="M0 -1500 V1500" stroke="#d5a3c8" strokeWidth="3.6" strokeOpacity="0.55" />
            <path d="M0 -1500 V1500" stroke="#fbf0fa" strokeWidth="1.7" />
          </motion.g>
        </g>
      </g>
    </g>
  )
}

export function LogoAssembly({ motionEnabled, ambientEnabled }: {
  motionEnabled: boolean
  ambientEnabled: boolean
}) {
  const uid = useId().replace(/:/g, '')
  const [assembled, setAssembled] = useState(false)
  const finish = useCallback(() => setAssembled(true), [])
  const showOriginal = !motionEnabled || assembled
  const showAmbient = motionEnabled && ambientEnabled && assembled

  return (
    <g data-assembly={motionEnabled ? (assembled ? 'complete' : 'revealing') : 'static'}>
      <defs>
        <g id={`${uid}-original`} fillRule="evenodd">
          {nkisaLogoGroups.map((group) => (
            <g key={group.id} data-logo-group={group.id}>
              {group.paths.map(({ id, d }) => <path key={id} d={d} data-logo-part={id} />)}
            </g>
          ))}
        </g>
        <filter id={`${uid}-scan-glow`} filterUnits="userSpaceOnUse" x="-40" y="-1500" width="80" height="3000" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        <linearGradient id={`${uid}-edge-light`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b87fe5" />
          <stop offset="0.5" stopColor="#f8eafa" />
          <stop offset="1" stopColor="#d5a3c8" />
        </linearGradient>
      </defs>

      {/* The complete original only replaces three already-revealed sectors.
          It removes mask/antialias overhead; it reveals no additional content. */}
      <use
        className="hero-visual__settled-logo"
        href={`#${uid}-original`}
        fill="white"
        opacity={showOriginal ? 1 : 0}
      />
      {!showOriginal && scanPasses.map((pass, index) => (
        <ScanReveal
          key={pass.id}
          pass={pass}
          uid={uid}
          onComplete={index === scanPasses.length - 1 ? finish : undefined}
        />
      ))}

      <g className="hero-visual__edge-signals" fill="none" stroke={`url(#${uid}-edge-light)`} strokeWidth="2.2" strokeLinecap="round">
        {nkisaTriangles.map((triangle, index) => (
          <motion.path
            key={triangle.id}
            className="hero-visual__signal"
            data-edge={triangle.id}
            d={triangle.centerline}
            initial={false}
            animate={showAmbient ? { pathLength: [0.01, 0.12, 0.06, 0.01], pathOffset: [0, 0.18, 0.9, 1], opacity: [0, 0.6, 0.4, 0] } : { opacity: 0, pathLength: 0, pathOffset: 0 }}
            transition={showAmbient ? { delay: 1.4 + index * 1.8, duration: index === 2 ? 4.8 : 7.2, times: [0, 0.18, 0.86, 1], repeat: Infinity, repeatDelay: 4.8, ease: 'linear' } : { duration: 0 }}
          />
        ))}
      </g>
    </g>
  )
}
