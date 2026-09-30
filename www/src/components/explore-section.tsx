import { useRef, useState, type KeyboardEvent } from 'react'
import { ArrowDownRight, ArrowUpRight, CornerDownRight } from 'lucide-react'
import { motion } from 'motion/react'

import { useHeroMotion } from '@/hooks/use-hero-motion'
import './explore-section.css'

type CodePart = { text: string; tone?: 'accent' | 'muted' | 'purple' | 'white' }
type Track = {
  name: string
  title: string
  subtitle: string
  description: string
  concepts: string[]
  file: string
  code: CodePart[][]
}

const tracks: Track[] = [
  {
    name: 'WEB',
    title: '网络安全',
    subtitle: '每一次请求，都藏着值得追问的细节。',
    description: '从浏览器到服务端，理解数据如何流动。学习 HTTP、身份认证与访问控制，在实践中找到系统的信任边界。',
    concepts: ['HTTP 协议', '代码审计', '访问控制'],
    file: 'request.http',
    code: [
      [{ text: '# Follow the request.', tone: 'muted' }],
      [{ text: 'GET ', tone: 'accent' }, { text: '/learn HTTP/1.1', tone: 'white' }],
      [{ text: 'Host: ', tone: 'purple' }, { text: 'lab.local' }],
      [{ text: 'Accept: ', tone: 'purple' }, { text: 'curiosity/*' }],
      [{ text: '' }],
      [{ text: '01 ', tone: 'accent' }, { text: '理解请求与响应' }],
      [{ text: '02 ', tone: 'accent' }, { text: '识别输入与信任边界' }],
      [{ text: '03 ', tone: 'accent' }, { text: '验证假设，修复问题' }],
    ],
  },
  {
    name: 'PWN',
    title: '二进制安全',
    subtitle: '深入内存，读懂程序运行的另一面。',
    description: '走进栈、堆与寄存器的世界。从 C 语言和操作系统开始，通过调试理解内存安全问题及其防护机制。',
    concepts: ['内存布局', '动态调试', '安全防护'],
    file: 'memory.c',
    code: [
      [{ text: '// Look beneath the surface.', tone: 'muted' }],
      [{ text: 'struct ', tone: 'purple' }, { text: 'memory ', tone: 'accent' }, { text: '{' }],
      [{ text: '  stack;   ', tone: 'white' }, { text: '// 函数调用与局部变量', tone: 'muted' }],
      [{ text: '  heap;    ', tone: 'white' }, { text: '// 动态分配的内存', tone: 'muted' }],
      [{ text: '  text;    ', tone: 'white' }, { text: '// 可执行指令', tone: 'muted' }],
      [{ text: '};' }],
      [{ text: '' }],
      [{ text: 'learn ', tone: 'accent' }, { text: '→ debug → understand' }],
    ],
  },
  {
    name: 'REVERSE',
    title: '逆向工程',
    subtitle: '没有源代码，也能一步步看清逻辑。',
    description: '把机器指令还原为可以理解的行为。结合静态分析与动态调试，追踪数据、梳理分支，重建程序的运行逻辑。',
    concepts: ['汇编语言', '静态分析', '控制流'],
    file: 'program.asm',
    code: [
      [{ text: '; Read between the instructions.', tone: 'muted' }],
      [{ text: 'entry:', tone: 'accent' }],
      [{ text: '  mov ', tone: 'purple' }, { text: 'eax, 0', tone: 'white' }],
      [{ text: '  add ', tone: 'purple' }, { text: 'eax, 1', tone: 'white' }],
      [{ text: '  cmp ', tone: 'purple' }, { text: 'eax, 1', tone: 'white' }],
      [{ text: '  je  ', tone: 'purple' }, { text: 'understood', tone: 'accent' }],
      [{ text: '' }],
      [{ text: 'understood: ', tone: 'accent' }, { text: '; 连接指令与意图', tone: 'muted' }],
    ],
  },
  {
    name: 'CRYPTO',
    title: '密码学',
    subtitle: '在数学与代码之间，寻找秘密的结构。',
    description: '理解加密为何成立，也理解它何时失效。从数论与编码入手，探索现代密码算法、协议设计和实现中的细节。',
    concepts: ['数论基础', '密码算法', '协议分析'],
    file: 'cipher.py',
    code: [
      [{ text: '# Mathematics keeps a secret.', tone: 'muted' }],
      [{ text: 'def ', tone: 'purple' }, { text: 'encrypt', tone: 'accent' }, { text: '(message, e, n):' }],
      [{ text: '    return ', tone: 'purple' }, { text: 'pow(message, e, n)', tone: 'white' }],
      [{ text: '' }],
      [{ text: '# 从简化模型走向真实协议', tone: 'muted' }],
      [{ text: '01 ', tone: 'accent' }, { text: '掌握数学基础' }],
      [{ text: '02 ', tone: 'accent' }, { text: '理解安全假设' }],
      [{ text: '03 ', tone: 'accent' }, { text: '审视实现细节' }],
    ],
  },
]

function CircuitMotif({ active }: { active: number }) {
  return (
    <svg className="explore-circuit" viewBox="0 0 190 190" fill="none" aria-hidden="true">
      <circle cx="95" cy="95" r="76" className="explore-circuit-orbit" />
      <circle cx="95" cy="95" r="55" className="explore-circuit-orbit explore-circuit-orbit-inner" />
      <path d="M74 66H66V124H74M116 66H124V124H116" className="explore-circuit-bracket" />
      <path d="M95 19V58M171 95H132M95 171V132M19 95H58" className="explore-circuit-path" />
      <path d="M42 42L66 66M148 42L124 66M148 148L124 124M42 148L66 124" className="explore-circuit-path" />
      <text x="95" y="94" textAnchor="middle" className="explore-circuit-label">0{active + 1}</text>
      <text x="95" y="111" textAnchor="middle" className="explore-circuit-caption">MODULE</text>
      {[[95, 19], [171, 95], [95, 171], [19, 95]].map(([cx, cy], index) => (
        <g key={index} className={active === index ? 'explore-circuit-node is-active' : 'explore-circuit-node'}>
          <circle cx={cx} cy={cy} r="7" />
          <circle cx={cx} cy={cy} r="2" />
        </g>
      ))}
      <circle cx="42" cy="42" r="2" className="explore-circuit-minor" />
      <circle cx="148" cy="42" r="2" className="explore-circuit-minor" />
      <circle cx="148" cy="148" r="2" className="explore-circuit-minor" />
      <circle cx="42" cy="148" r="2" className="explore-circuit-minor" />
    </svg>
  )
}

export function ExploreSection({ motionEnabled = true }: { motionEnabled?: boolean }) {
  const prefersMotion = useHeroMotion()
  const animate = motionEnabled && prefersMotion
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tracks.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tracks.length) % tracks.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tracks.length - 1
    else return
    event.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <motion.section
      id="explore"
      aria-labelledby="explore-heading"
      className="explore-section site-container"
      data-motion={animate ? 'on' : 'off'}
      initial={animate ? { opacity: 0, y: 42 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: animate ? 0.8 : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="explore-eyebrow"><span>02 / EXPLORE THE UNKNOWN</span><span aria-hidden="true">[ 技术探索方向 ]</span></div>
      <div className="explore-intro">
        <h2 id="explore-heading">寻找技术的<span>突破口。</span></h2>
        <p>安全的世界，没有唯一的入口。<br />四个技术方向，连接不同的探索路径。</p>
      </div>

      <div className="explore-workbench">
        <div className="explore-tracks" role="tablist" aria-label="信息安全技术方向" aria-orientation="vertical">
          {tracks.map((track, index) => (
            <button
              className={`explore-track${active === index ? ' is-active' : ''}`}
              key={track.name}
              ref={(node) => { tabs.current[index] = node }}
              type="button"
              role="tab"
              id={`explore-tab-${index}`}
              aria-controls={`explore-panel-${index}`}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => handleTabKey(event, index)}
            >
              <span className="explore-track-number">0{index + 1}</span>
              <span className="explore-track-name">{track.name}</span>
              <span className="explore-track-chinese">{track.title}</span>
              <ArrowDownRight className="explore-track-arrow" size={20} aria-hidden="true" />
            </button>
          ))}
          <div className="explore-track-note"><CornerDownRight size={14} aria-hidden="true" /><span>切换方向，了解学习内容。</span></div>
        </div>

        <div className="explore-terminal">
          <div className="explore-terminal-chrome">
            <div className="explore-window-dots" aria-hidden="true"><i /><i /><i /></div>
            <span>nkisa / learning-path</span>
            <span className="explore-terminal-state"><i /> READY</span>
          </div>
          {tracks.map((track, index) => (
            <div key={track.name} id={`explore-panel-${index}`} role="tabpanel" aria-labelledby={`explore-tab-${index}`} tabIndex={0} hidden={active !== index} className="explore-panel">
              {active === index && (
                <motion.div
                  initial={animate ? { opacity: 0, y: 9 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: animate ? 0.3 : 0 }}
                >
                  <div className="explore-terminal-file"><span><i />{track.file}</span><span>UTF-8</span></div>
                  <div className="explore-terminal-code">
                    <div className="explore-code-lines" aria-label="技术方向示例">
                      {track.code.map((line, lineIndex) => (
                        <div className="explore-code-line" key={lineIndex}>
                          <span className="explore-code-number" aria-hidden="true">{String(lineIndex + 1).padStart(2, '0')}</span>
                          <code>{line.map((part, partIndex) => <span key={partIndex} className={part.tone ? `explore-syntax-${part.tone}` : undefined}>{part.text}</span>)}</code>
                        </div>
                      ))}
                    </div>
                    <CircuitMotif active={active} />
                  </div>
                  <div className="explore-terminal-description">
                    <h3>{track.subtitle}</h3>
                    <p>{track.description}</p>
                    <ul aria-label="学习内容">{track.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ul>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          <div className="explore-terminal-footer"><span><span className="explore-prompt">➜</span> learn. break. understand.<span className="explore-cursor" aria-hidden="true" /></span><span>0{active + 1} / 04</span></div>
        </div>
      </div>

      <div className="explore-bottom"><p>好奇心是起点。实践让理解更进一步。</p><a href="https://ctf.nkisa.com" target="_blank" rel="noopener noreferrer">进入 CTF 靶场 <ArrowUpRight size={17} aria-hidden="true" /></a></div>
    </motion.section>
  )
}
