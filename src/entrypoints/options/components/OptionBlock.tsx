import type { ReactNode } from 'react'

interface OptionBlockProps {
  id: string
  title: string
  children?: ReactNode
}

export default function OptionBlock({ id, title, children }: OptionBlockProps) {
  return (
    <div className="pt-5">
      <h2 id={`${id}`} className="pb-3 pt-5 text-2xl font-semibold">
        {title}
      </h2>
      <div>
        {children}
      </div>
    </div>
  )
}
