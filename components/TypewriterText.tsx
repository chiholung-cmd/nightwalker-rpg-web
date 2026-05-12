'use client'

import { useEffect, useState } from 'react'

export default function TypewriterText({
  text,
  speed = 12,
}: {
  text: string
  speed?: number
}) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')

    let index = 0

    const interval = setInterval(() => {
      index += 1
      setDisplayed(text.slice(0, index))

      if (index >= text.length) {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <p>{displayed}</p>
}
