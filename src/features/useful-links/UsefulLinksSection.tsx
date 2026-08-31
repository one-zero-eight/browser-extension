import type { LinkInfo } from '@/features/useful-links/links'
import { linksIndexMap } from '@/features/useful-links/links'
import { useStorage } from '@/shared/storage'
import LinkButton from '@/features/useful-links/LinkButton'

export function UsefulLinksSection() {
  const pinnedLinks = JSON.parse(useStorage('pinnedLinks') ?? '{}') as Record<string, LinkInfo>
  const pinned = Object.values(pinnedLinks).map(link => linksIndexMap[link.title] ?? link)

  return (
    <section className="px-4 pt-4">
      <h2 className="mb-2 mt-0 text-xs font-semibold tracking-wide text-base-content/50 uppercase">Services</h2>
      {pinned.length === 0
        ? (
          <button
            type="button"
            onClick={() => chrome.runtime.openOptionsPage()}
            className="flex w-full items-center gap-3 rounded-box bg-base-200 p-3 text-left transition-colors hover:bg-base-300"
          >
            <span className="icon-[material-symbols--add-link-rounded] text-xl text-base-content/50" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Add services</span>
              <span className="block text-xs text-base-content/50">Choose them in settings</span>
            </span>
            <span className="icon-[material-symbols--chevron-right-rounded] text-lg text-base-content/50" />
          </button>
          )
        : (
          <div className="grid grid-cols-5 gap-1">
            {pinned.map(link => (
              <LinkButton key={link.href} title={link.title} href={link.href} className={link.className} />
            ))}
          </div>
          )}
    </section>
  )
}
