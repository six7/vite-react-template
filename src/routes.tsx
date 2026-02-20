import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'

import Home from './pages/home'
import TetrisPage from './pages/tetris'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="/tetris" element={<TetrisPage />} />
    </>
  ),
  { basename: import.meta.env.BASE_URL }
)
