import type { LinkInfo } from '@/features/useful-links/links'
import { useStorage } from '@/shared/storage'
import LinkButton from '@/features/useful-links/LinkButton'

export function UsefulLinksSection() {
  const pinnedLinks = JSON.parse(useStorage('pinnedLinks') ?? '{}') as Record<string, LinkInfo>

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {Object.values(pinnedLinks).map((link) => {
        return <LinkButton key={link.href} title={link.title} href={link.href} className={link.className} />
      })}
    </div>
  )
}
