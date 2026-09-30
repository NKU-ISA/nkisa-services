import { useRef } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, CornerDownRight, Crosshair } from 'lucide-react'
import { motion, useScroll, useTransform, type Variants } from 'motion/react'
import { HeroVisual } from '@/components/hero-visual'
import { useHeroMotion } from '@/hooks/use-hero-motion'

const reveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
}

export function HeroSection() {
  const motionEnabled = useHeroMotion()
  const root = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] })
  const artY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 70])

  return (
    <section id="home" ref={root} aria-labelledby="hero-heading" className="hero-section">
      <div className="hero-grid-background" aria-hidden="true" />
      <div className="site-container hero-grid">
        <motion.div className="hero-copy" style={{ y: motionEnabled ? copyY : 0 }} initial={motionEnabled ? 'hidden' : false} animate="visible" variants={{ visible: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } } }}>
          <motion.p className="hero-eyebrow" variants={reveal}><span className="status-dot" />好奇心，是我们的第一行代码</motion.p>
          <h1 id="hero-heading" className="hero-title">
            <motion.span variants={reveal}>探索边界<span className="hero-punctuation">，</span></motion.span>
            <motion.span className="hero-title-accent" variants={reveal}>理解安全<span className="hero-punctuation">。</span></motion.span>
          </h1>
          <motion.p className="hero-english mono" variants={reveal}>CURIOSITY. <span>DISCOVERY.</span><span className="text-cursor" aria-hidden="true" /></motion.p>
          <motion.p className="hero-description" variants={reveal}>这里是南开大学信息安全协会。<br />在技术交流与实践中，拆解未知，连接灵感，<br className="desktop-break" />共同探索信息安全的更多可能。</motion.p>
          <motion.div className="hero-actions" variants={reveal}>
            <a href="https://ctf.nkisa.com" target="_blank" rel="noopener noreferrer" className="button button-primary"><span>进入 CTF 靶场</span><ArrowUpRight size={19} aria-hidden="true" /></a>
            <a href="#about" className="button button-text">认识 NKISA<ArrowRight size={17} aria-hidden="true" /></a>
          </motion.div>
          <motion.div className="hero-caption mono" variants={reveal}><CornerDownRight size={13} aria-hidden="true" /><span>LEARN. SHARE. HACK.</span><span className="hero-caption-line" /><span>始于热爱，不止于技术</span></motion.div>
        </motion.div>
        <motion.div className="hero-artwork" style={{ y: motionEnabled ? artY : 0 }} initial={motionEnabled ? { opacity: 0, scale: 0.94 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}>
          <HeroVisual ambientPaused={!motionEnabled} />
        </motion.div>
      </div>
      <div className="site-container hero-baseline">
        <a href="#about" className="scroll-cue"><span className="scroll-cue-icon"><ArrowDown size={15} /></span><span className="mono">SCROLL TO EXPLORE</span></a>
        <span className="hero-location mono">NKU INFOSEC ASSOCIATION <span>/</span> TIANJIN, CN</span>
        <span className="hero-index mono"><Crosshair size={13} /> 001 — ∞</span>
      </div>
    </section>
  )
}
