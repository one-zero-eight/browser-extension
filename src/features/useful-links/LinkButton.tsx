export default function LinkButton({ href, title, className }: {
  href: string
  title: string
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title={title}
      className="group flex min-w-0 flex-col items-center gap-1 rounded-field px-1 py-2 text-base-content no-underline transition-colors hover:bg-base-200"
    >
      <span className={`${className ?? ''} text-[1.7rem] text-base-content/50 transition-colors group-hover:text-primary`} />
      <span className="max-w-full truncate text-[11px] leading-tight text-base-content/60">{title}</span>
    </a>
  )
}
