import type { ReactNode } from 'react'

interface OptionBlockProps {
  id: string
  title: string
  description?: string
  action?: ReactNode
  children?: ReactNode
}

export default function OptionBlock({ id, title, description, action, children }: OptionBlockProps) {
  return (
    <section id={id} className="overflow-hidden rounded-box bg-base-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-5 py-4">
        <div className="min-w-0">
          <h2 className="m-0 text-base font-semibold">{title}</h2>
          {description && <p className="mt-1 mb-0 text-sm text-base-content/50">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
