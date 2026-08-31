import { cn } from '@/shared/ui/utils'

interface LinkSettingProps {
  title: string
  className: string
  pinned?: boolean
  onClick?: () => void
}

export default function LinkSetting({ title, className, pinned, onClick }: LinkSettingProps) {
  return (
    <button
      type="button"
      aria-pressed={pinned}
      onClick={onClick}
      title={pinned ? `Unpin ${title}` : `Pin ${title}`}
      className={cn(
        'flex h-10 w-full items-center gap-2.5 rounded-field border bg-transparent px-3 text-left text-sm text-base-content transition-colors',
        pinned
          ? 'border-primary/40'
          : 'border-base-300 text-base-content/70 hover:bg-base-100',
      )}
    >
      <span className={cn(className, 'text-xl', pinned ? 'text-primary' : 'text-base-content/50')} />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {pinned && <span className="icon-[material-symbols--check-rounded] text-base text-primary" />}
    </button>
  )
}
