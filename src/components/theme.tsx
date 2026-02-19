import * as Lucide from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useLocalStorage } from '#/context/hooks/useLocalStorage'

import { Button, ctrp } from './ui-react-aria'

type Theme = 'light' | 'dark' | 'system'

const themeOrder: Theme[] = ['light', 'dark', 'system']

const themeIcons: Record<Theme, React.ComponentType<{ className?: string }>> = {
  light: Lucide.SunDim,
  dark: Lucide.Moon,
  system: Lucide.Monitor,
}

function resolveSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const effective = theme === 'system' ? resolveSystemTheme() : theme
  document.documentElement.classList.toggle('dark', effective === 'dark')
}

interface ThemeSwitcherProps {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [savedTheme, setSavedTheme] = useLocalStorage<Theme>('ui_theme', 'light')

  // Sync the DOM class with the saved preference on mount and change
  useEffect(() => {
    applyTheme(savedTheme)
  }, [savedTheme])

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (savedTheme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [savedTheme])

  const cycleTheme = useCallback(() => {
    const nextIndex = (themeOrder.indexOf(savedTheme) + 1) % themeOrder.length
    setSavedTheme(themeOrder[nextIndex])
  }, [savedTheme, setSavedTheme])

  const IconComponent = themeIcons[savedTheme as Theme] ?? Lucide.SunDim

  return (
    <Button className={ctrp(className, 'px-2')} variant="icon" onPress={cycleTheme}>
      <IconComponent className="h-5 w-5" />
    </Button>
  )
}
