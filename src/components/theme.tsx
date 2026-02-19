import * as Lucide from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useLocalStorage } from '#/context/hooks/useLocalStorage'

import { Button, ctrp } from './ui-react-aria'

interface ThemeSwitcherProps {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [savedTheme, setSavedTheme] = useLocalStorage('ui_theme', 'light')
  const IconComponent = savedTheme === 'dark' ? Lucide.Moon : Lucide.SunDim

  // Sync the DOM class with the saved preference on mount
  useEffect(() => {
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [savedTheme])

  const toggleTheme = useCallback(() => {
    setSavedTheme(savedTheme === 'light' ? 'dark' : 'light')
  }, [savedTheme, setSavedTheme])

  return (
    <Button className={ctrp(className, 'px-2')} variant="icon" onPress={toggleTheme}>
      <IconComponent className="h-5 w-5" />
    </Button>
  )
}
