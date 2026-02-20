import { Link } from 'react-router-dom'

import ViteLogo from '../assets/images/vite.svg'

export default function Home() {
  return (
    <div className="mx-auto flex h-full min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full items-center justify-center">
          <img src={ViteLogo} alt="Vite logo" className="h-28" />
        </div>
        <div className="text-center text-gray-600 text-lg dark:text-gray-400">
          <p className="leading-8">Vite + React + Typescript + Tailwind CSS</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="font-semibold text-gray-700 dark:text-gray-300">Games</p>
          <Link
            to="/tetris"
            className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-500"
          >
            🎮 Tetris
          </Link>
        </div>
      </div>
    </div>
  )
}
