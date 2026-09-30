import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Copy, Terminal, Trophy } from 'lucide-react'
import { Reveal } from '@/components/about-section'

type Entry = { id: number; command: string; response: string; success?: boolean }
const encoded = 'TktJU0F7aGVsbG9fd29ybGR9'
const flag = 'NKISA{hello_world}'
const help = 'help          查看可用命令\nls            查看挑战文件\ncat welcome.txt  阅读题目\ndecode        解码 Base64 字符串\nsubmit <flag> 提交 flag\nclear         清空终端'

export function PracticeSection() {
  const [command, setCommand] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [solved, setSolved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const history = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const commandHistory = useRef<string[]>([])
  const historyCursor = useRef(0)
  const nextEntry = useRef(0)

  function run(raw: string) {
    const value = raw.trim()
    if (!value) return
    const normalized = value.toLowerCase()
    let response = ''
    let success = false
    if (normalized === 'clear') setEntries([])
    else {
      if (normalized === 'help') response = help
      else if (normalized === 'ls') response = 'welcome.txt    first_flag.b64'
      else if (normalized === 'whoami') response = 'guest@nkisa · 当前身份：访客。'
      else if (normalized === 'cat welcome.txt') response = `任务：解码下面的 Base64 字符串，获取第一枚 flag。\n${encoded}\n提示：输入 decode，或使用 Base64 工具解码。\n最后输入 submit <flag> 提交答案。`
      else if (normalized === 'cat first_flag.b64') response = encoded
      else if (normalized === 'decode') response = `${flag}\n解码完成。输入 submit ${flag} 提交答案。`
      else if (value === `submit ${flag}` || value === flag) {
        response = 'FLAG ACCEPTED ✓\n第一枚 flag，已捕获。入门挑战完成。'
        success = true
        setSolved(true)
      } else if (normalized.startsWith('submit')) response = 'flag 不匹配。检查大小写和花括号后可重新提交。'
      else response = `未识别的命令：${value}\n输入 help 查看可用命令。`
      const entry = { id: nextEntry.current++, command: value, response, success }
      setEntries((current) => [...current.slice(-11), entry])
    }
    commandHistory.current = [...commandHistory.current.slice(-49), value]
    historyCursor.current = commandHistory.current.length
    setCommand('')
    requestAnimationFrame(() => {
      history.current?.scrollTo({ top: history.current.scrollHeight, behavior: 'instant' })
    })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    run(command)
  }

  async function copyChallenge() {
    try {
      await navigator.clipboard.writeText(encoded)
      setCopied(true)
      setCopyFailed(false)
    } catch {
      setCopyFailed(true)
    }
  }

  return (
    <section id="practice" className="practice-section site-container" aria-labelledby="practice-heading">
      <Reveal className="practice-intro">
        <div className="section-eyebrow mono"><span className="section-square" />03 / LESS TALK. MORE HACK.</div>
        <h2 className="section-title" id="practice-heading">第一枚 flag，<br /><span className="accent">从这里开始。</span></h2>
        <p className="section-description">技术的乐趣，藏在亲手解开问题的瞬间。<br />从一个编码挑战开始，理解 CTF 的解题过程。</p>
        <div className="challenge-meta"><span className="challenge-level"><i />入门挑战</span><span className="mono">BASE64 / ENCODING</span></div>
        <div className="challenge-source"><span className="mono">{encoded}</span><button type="button" className="icon-button" onClick={copyChallenge} aria-label={copied ? '已复制挑战字符串' : '复制挑战字符串'}>{copied ? <Check size={15} /> : <Copy size={15} />}</button></div>
        <p className="challenge-hint" role="status">{copyFailed ? '复制失败，可选中上方字符串手动复制。' : copied ? '已复制，可使用 Base64 工具解码。' : '提示：Base64 是一种编码。输入 help 获取帮助。'}</p>
        <a className="inline-link" href="https://ctf.nkisa.com" target="_blank" rel="noopener noreferrer">前往靶场，挑战更多<ArrowUpRight size={17} /></a>
      </Reveal>
      <Reveal className={`challenge-terminal${solved ? ' is-solved' : ''}`} delay={0.12}>
        <div className="terminal-titlebar"><div className="window-dots" aria-hidden="true"><i /><i /><i /></div><span className="mono">guest@nkisa: ~/first-step</span><Terminal size={14} aria-hidden="true" /></div>
        <div className="terminal-output mono" ref={history} role="log" aria-label="挑战终端输出" tabIndex={0}>
          <div className="terminal-welcome"><span className="terminal-ascii" aria-hidden="true">[ NKISA / FIRST CHALLENGE ]</span><p>NKISA 交互终端已就绪。<br />挑战内容：解码一段 Base64 信息。</p><p className="terminal-dim">输入 help 查看命令，或输入 decode 开始。</p></div>
          {entries.map((entry) => <div className="terminal-entry" key={entry.id}><div className="terminal-command"><span>❯</span> {entry.command}</div><pre className={entry.success ? 'terminal-success' : ''}>{entry.response}</pre></div>)}
        </div>
        <form onSubmit={submit} className="terminal-input-row"><label htmlFor="terminal-command" className="mono">guest<span>@</span>nkisa <ChevronRight size={14} /></label><input ref={input} id="terminal-command" type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="输入终端命令" maxLength={200} value={command} placeholder="help" onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault()
            historyCursor.current = Math.max(0, Math.min(commandHistory.current.length, historyCursor.current + (event.key === 'ArrowUp' ? -1 : 1)))
            setCommand(commandHistory.current[historyCursor.current] ?? '')
          }
        }} /><button type="submit" className="icon-button" aria-label="执行命令"><ArrowRight size={17} /></button></form>
        <div className="terminal-bottom"><span className="mono">{solved ? <><Trophy size={12} /> FIRST FLAG CAPTURED</> : <><span className="status-dot" /> TERMINAL READY</>}</span><button type="button" onClick={() => { run(solved ? 'help' : 'decode'); input.current?.focus() }}>{solved ? '查看可用命令' : '运行 decode'}<ArrowUpRight size={12} /></button></div>
      </Reveal>
    </section>
  )
}
