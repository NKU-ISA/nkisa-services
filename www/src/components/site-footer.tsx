import { useState } from 'react'
import { ArrowUp, ArrowUpRight, Asterisk } from 'lucide-react'
import { Reveal } from '@/components/about-section'

export function SiteFooter() {
  const [year] = useState(() => new Date().getFullYear())
  return (
    <footer className="site-footer">
      <div className="site-container">
        <Reveal className="footer-invitation"><div><div className="section-eyebrow mono"><span className="status-dot" />THE NEXT CHAPTER</div><h2>未知，值得一探<span className="accent">。</span></h2><p>好奇心连接彼此，实践让探索不断延伸。</p></div><a href="https://ctf.nkisa.com" target="_blank" rel="noopener noreferrer" className="footer-portal" aria-label="进入 CTF 靶场，开启探索"><ArrowUpRight size={44} strokeWidth={1.25} /><span>开启探索</span></a></Reveal>
        <div className="footer-wordmark" aria-hidden="true"><span>NKISA</span><Asterisk strokeWidth={0.8} /></div>
        <div className="footer-baseline"><span>© {year} 南开大学信息安全协会</span><span className="mono">MADE OF CURIOSITY.</span><a href="#home">回到顶部<ArrowUp size={14} /></a></div>
      </div>
    </footer>
  )
}
