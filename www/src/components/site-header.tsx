import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react'
import { motion, useScroll } from 'motion/react'
import logo from '@/assets/brand/nkisa-logo-white.svg'

const links = [
  { href: '#about', label: '关于协会' },
  { href: '#explore', label: '探索方向' },
  { href: '#practice', label: '即刻实践' },
]

export function SiteHeader({ motionEnabled, motionAllowed, onToggleMotion }: {
  motionEnabled: boolean
  motionAllowed: boolean
  onToggleMotion: () => void
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const menuButton = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(`#${entry.target.id}`)
      }
    }, { rootMargin: '-20% 0px -45% 0px' })
    document.querySelectorAll('#home, #about, #explore, #practice').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', close)
    window.addEventListener('pointerdown', outside)
    return () => {
      window.removeEventListener('keydown', close)
      window.removeEventListener('pointerdown', outside)
    }
  }, [open])

  return (
    <header className="site-header" ref={header}>
      <div className="site-container header-inner">
        <a href="#home" aria-label="NKISA 首页" className="site-brand" onClick={() => setOpen(false)}>
          <img src={logo} alt="" width="42" height="42" />
          <span className="site-wordmark">NKISA<span>.</span></span>
          <span className="site-brand-description">南开大学<br />信息安全协会</span>
        </a>
        <nav className="desktop-nav" aria-label="主导航">
          {links.map((link) => <a key={link.href} href={link.href} aria-current={active === link.href ? 'location' : undefined}>{link.label}</a>)}
        </nav>
        <div className="header-actions">
          <button className="motion-toggle icon-button" type="button" onClick={onToggleMotion} disabled={!motionAllowed} aria-label={!motionAllowed ? '系统已设置减少动态效果' : motionEnabled ? '暂停页面动效' : '开启页面动效'} aria-pressed={!motionEnabled} title={!motionAllowed ? '遵循系统减少动态效果设置' : motionEnabled ? '暂停动效' : '开启动效'}>
            {motionEnabled ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <a className="header-cta" href="https://ctf.nkisa.com" target="_blank" rel="noopener noreferrer">CTF 靶场 <ArrowUpRight size={15} aria-hidden="true" /></a>
          <button className="mobile-menu-toggle icon-button" ref={menuButton} type="button" aria-label={open ? '关闭导航' : '打开导航'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      <nav id="mobile-navigation" className="mobile-nav" aria-label="移动端导航" hidden={!open}>
        {links.map((link, index) => <a key={link.href} href={link.href} aria-current={active === link.href ? 'location' : undefined} onClick={() => setOpen(false)}><span className="mono">0{index + 1}</span>{link.label}<ArrowUpRight size={18} /></a>)}
      </nav>
      <motion.div className="reading-progress" style={{ scaleX: scrollYProgress }} />
    </header>
  )
}
