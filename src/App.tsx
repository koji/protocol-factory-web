import type { ReactNode } from 'react'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header/Header'
import { Hero } from './components/Hero/Hero'
import { Features } from './components/Features/Features'
import { AiWorkflow } from './components/AiWorkflow/AiWorkflow'
import { Screenshot } from './components/Screenshot/Screenshot'
import { TryCta } from './components/TryCta/TryCta'
import { Install } from './components/Install/Install'
import { Disclaimer } from './components/Disclaimer/Disclaimer'
import { Footer } from './components/Footer/Footer'

export default function App(): ReactNode {
  const { theme, toggleTheme } = useTheme()

  return (
    <div id="top">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Features />
        <AiWorkflow />
        <Screenshot />
        <TryCta />
        <Install />
      </main>
      <Disclaimer />
      <Footer />
    </div>
  )
}
