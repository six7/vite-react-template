import { useEffect, useState } from 'react'

const frames = [
  `
    ╱|、
  (˚ˎ 。7
   |、˜〵
   じしˍ,)ノ
  `,
  `
    ╱|、
  (˚ˎ 。7
   |、˜〵
  じしˍ,)ノ
  `,
  `
     ╱|、
   (˚ˎ 。7
    |、˜〵
   じしˍ,)ノ
  `,
  `
      ╱|、
    (˚ˎ 。7
     |、˜〵
    じしˍ,)ノ
  `,
  `
       ╱|、
     (˚ˎ 。7
      |、˜〵
     じしˍ,)ノ
  `,
  `
        ╱|、
      (˚ˎ 。7
       |、˜〵
      じしˍ,)ノ
  `,
  `
       ╱|、
     (˚ˎ 。7
      |、˜〵
     じしˍ,)ノ
  `,
  `
      ╱|、
    (˚ˎ 。7
     |、˜〵
    じしˍ,)ノ
  `,
  `
     ╱|、
   (˚ˎ 。7
    |、˜〵
   じしˍ,)ノ
  `,
  `
    ╱|、
  (˚ˎ 。7
   |、˜〵
  じしˍ,)ノ
  `,
]

export function AsciiAnimation() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length)
    }, 300)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="mx-auto w-full max-w-md px-4 py-8 text-center">
      <p className="mb-3 text-gray-500 text-sm dark:text-gray-400">~ resident ASCII cat ~</p>
      <pre
        className="inline-block text-left font-mono text-gray-600 text-sm leading-tight dark:text-gray-300"
        aria-hidden
      >
        {frames[index]}
      </pre>
    </section>
  )
}
