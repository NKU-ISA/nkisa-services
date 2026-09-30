import { useState } from 'react'
import { MotionConfig } from 'motion/react'
import { AboutSection, TechMarquee } from '@/components/about-section'
import { ExploreSection } from '@/components/explore-section'
import { HeroSection } from '@/components/hero-section'
import { PracticeSection } from '@/components/practice-section'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { MotionEnabledContext, useHeroMotion } from '@/hooks/use-hero-motion'

function App() {
  const preferredMotion = useHeroMotion()
  const [paused, setPaused] = useState(false)
  const motionEnabled = preferredMotion && !paused
  return (
    <MotionEnabledContext.Provider value={motionEnabled}>
      <MotionConfig reducedMotion={motionEnabled ? 'never' : 'always'}>
        <div className="site-page" data-motion={motionEnabled ? 'on' : 'off'}>
          <a className="skip-link" href="#main-content">跳至主要内容</a>
          <SiteHeader motionEnabled={motionEnabled} motionAllowed={preferredMotion} onToggleMotion={() => setPaused((value) => !value)} />
          <main id="main-content" tabIndex={-1}>
            <HeroSection />
            <TechMarquee />
            <AboutSection />
            <ExploreSection />
            <PracticeSection />
          </main>
          <SiteFooter />
        </div>
      </MotionConfig>
    </MotionEnabledContext.Provider>
  )
}

export default App
