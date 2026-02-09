import { cn } from '@/shared/ui/utils'

interface LinkSettingProps {
  title: string
  className: string
  pinned?: boolean
  onClick?: () => void
}

export default function LinkSetting({ title, className, pinned, onClick }: LinkSettingProps) {
  return (
    <div className="mb-2 w-fit flex cursor-pointer cursor-pointer items-center transition-300 hover:text-[#9747FF]" onClick={onClick}>
      <p
        className={cn(
          'shrink-0 text-3xl rounded-full p-1 my-0 mr-1',
          className,
        )}
      >
      </p>
      <div>
        <p className="my-0 text-base">{title}</p>
        <p className="my-0 text-xs">
          Click to
          {pinned ? ' unpin' : ' pin'}
        </p>
      </div>
    </div>
  )
}
