'use client'

import Image from 'next/image'

export default function CinematicDialogue({
  name,
  role,
  portrait,
  text,
  danger,
}: {
  name: string
  role: string
  portrait: string
  text: string
  danger?: boolean
}) {
  return (
    <div className={`nw-dialogue ${danger ? 'danger' : ''}`}>
      <div className="nw-portrait-wrap">
        <Image
          src={portrait}
          alt={name}
          width={240}
          height={360}
          className="nw-portrait"
        />

        <div className="nw-portrait-shadow" />
      </div>

      <div className="nw-dialogue-box">
        <div className="nw-name-row">
          <div>
            <div className="nw-name">{name}</div>
            <div className="nw-role">{role}</div>
          </div>

          {danger && (
            <div className="nw-alert">
              HIGH RISK
            </div>
          )}
        </div>

        <div className="nw-text">
          {text}
        </div>
      </div>
    </div>
  )
}
