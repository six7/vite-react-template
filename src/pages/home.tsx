import { AsciiAnimation } from '#/components/ascii-animation'
import { ThemeSwitcher } from '#/components/theme'

import ViteLogo from '../assets/images/vite.svg'

export default function Home() {
  return (
    <div className="mx-auto flex h-full min-h-screen w-full flex-col">
      <header className="mb-auto w-full p-4" aria-hidden>
        <ThemeSwitcher className="float-right size-9" />
      </header>
      <div className="mx-auto flex flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full items-center justify-center">
          <img src={ViteLogo} alt="Vite logo" className="h-28" />
        </div>
        <div className="text-center text-gray-600 text-lg dark:text-gray-400">
          <p className="leading-8">Vite + React + Typescript + Tailwind CSS</p>
        </div>
      </div>
      <AsciiAnimation />
    </div>
  )
}
