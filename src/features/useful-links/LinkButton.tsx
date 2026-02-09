import { Tooltip } from '@/features/useful-links/Tooltip'
import { cn } from '@/shared/ui/utils'

export default function LinkButton({ href, title, className }: {
  href: string
  title: string
  className?: string
}) {
  return (
    <Tooltip content={title} className="h-fit w-fit flex shrink-0">
      <a
        href={href}
        target="_blank"
        className={cn(
          'shrink-0 text-3xl rounded-full p-2 hover:bg-blue-500',
          className,
        )}
      />
    </Tooltip>
  )
}
