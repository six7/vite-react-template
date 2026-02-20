import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'

import Home from './pages/home'
import Tetris from './pages/tetris'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="/tetris" element={<Tetris />} />
    </>
  ),
  { basename: import.meta.env.BASE_URL }
)
