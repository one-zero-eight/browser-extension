import type { LinkInfo } from '@/features/useful-links/links'
import { useStorage } from '@/shared/storage'
import LinkButton from '@/features/useful-links/LinkButton'

export function UsefulLinksSection() {
  const pinnedLinks = JSON.parse(useStorage('pinnedLinks') ?? '{}') as Record<string, LinkInfo>

  if (Object.keys(pinnedLinks).length === 0) {
    return (
      <div className="py-2 pl-3 text-sm text-gray-500">
        No pinned links. You can pin links in the extension
        {' '}
        <a onClick={() => chrome.runtime.openOptionsPage()} className="cursor-pointer text-[#9474FF] hover:decoration-underline">options</a>
        .
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {Object.values(pinnedLinks).map((link) => {
        return <LinkButton key={link.href} title={link.title} href={link.href} className={link.className} />
      })}
    </div>
  )
}
