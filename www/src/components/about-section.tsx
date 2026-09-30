import { useRef, type ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Braces, Code2, Radio, ScanLine } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useHeroMotion } from '@/hooks/use-hero-motion'

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const enabled = useHeroMotion()
  return <motion.div className={className} initial={enabled ? { opacity: 0, y: 32 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: enabled ? 0.75 : 0, delay: enabled ? delay : 0, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

const ideas = [
  { number: '01', icon: Code2, tag: 'KEEP LEARNING', title: '让好奇，走得更远。', text: '从第一行代码，到理解系统的底层逻辑。在问题中学习，在探索中建立系统的安全视角。', chips: ['基础学习', '技术探索'] },
  { number: '02', icon: Radio, tag: 'SHARE OPENLY', title: '让灵感，在交流中发生。', text: '一个人的思路有边界，一群人的讨论有更多可能。分享解题思路，也分享那些值得推敲的问题。', chips: ['思路碰撞', '共同成长'] },
  { number: '03', icon: ScanLine, tag: 'BUILD & BREAK', title: '让理解，经得起实战。', text: '走进 CTF 的世界，把想法写成代码，把知识变成解决问题的能力。每一枚 flag，都是新的起点。', chips: ['CTF 竞赛', '靶场实践'] },
]

function StoryItem({ item }: { item: typeof ideas[number] }) {
  const root = useRef<HTMLElement>(null)
  const enabled = useHeroMotion()
  const { scrollYProgress } = useScroll({ target: root, offset: ['start 85%', 'start 35%'] })
  const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
  return (
    <article className="story-item" ref={root}>
      <div className="story-item-meta mono"><span>{item.number} / {item.tag}</span><item.icon size={19} strokeWidth={1.4} /></div>
      <h3 className="story-title"><span>{item.title}</span><motion.span aria-hidden="true" className="story-title-fill" style={{ clipPath: enabled ? clipPath : 'inset(0)' }}>{item.title}</motion.span></h3>
      <p>{item.text}</p>
      <div className="story-tags">{item.chips.map((chip) => <span key={chip}>{chip}</span>)}</div>
    </article>
  )
}

export function AboutSection() {
  const root = useRef<HTMLElement>(null)
  const enabled = useHeroMotion()
  const { scrollYProgress } = useScroll({ target: root, offset: ['start end', 'end start'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-25, 95])
  const y = useTransform(scrollYProgress, [0, 1], [20, -35])
  return (
    <section id="about" ref={root} className="about-section site-container" aria-labelledby="about-heading">
      <div className="about-intro">
        <div className="section-eyebrow mono"><span className="section-square" />01 / HELLO, NKISA</div>
        <Reveal><h2 id="about-heading" className="section-title">因好奇而相遇，<br />为热爱而探索<span className="accent">。</span></h2><p className="section-description">我们是一群对信息安全充满好奇的南开人。<br />在这里，学习、交流与实践始终相连。</p></Reveal>
        <div className="about-schematic" aria-hidden="true">
          <div className="schematic-cross cross-one">+</div><div className="schematic-cross cross-two">+</div>
          <motion.div className="schematic-orbit" style={{ rotate: enabled ? rotate : 0 }}><i /><i /><i /></motion.div>
          <motion.div className="schematic-core" style={{ y: enabled ? y : 0 }}><Braces strokeWidth={1} size={40} /><span className="mono">CURIOSITY</span></motion.div>
          <span className="schematic-caption mono">INPUT: CURIOSITY<br />OUTPUT: POSSIBILITY_</span>
          <ArrowDownRight className="schematic-arrow" size={30} strokeWidth={1} />
        </div>
      </div>
      <div className="about-stories">{ideas.map((idea) => <StoryItem key={idea.number} item={idea} />)}<a className="inline-link" href="#explore">探索信息安全方向<ArrowUpRight size={18} /></a></div>
    </section>
  )
}

export function TechMarquee() {
  const words = ['CURIOSITY', 'BUILD', 'BREAK', 'LEARN', 'REPEAT']
  return (
    <div className="tech-marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((group) => (
          <div className="marquee-group" key={group}>
            {words.map((word) => (
              <span key={word}>
                {word}
                <svg className="marquee-star" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" focusable="false">
                  <path d="M16 3v26M3 16h26M6.8 6.8l18.4 18.4M6.8 25.2 25.2 6.8" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
