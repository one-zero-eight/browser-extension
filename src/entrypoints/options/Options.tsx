import NavigationPanel from '@/entrypoints/options/components/NavigationPanel'
import OptionBlock from '@/entrypoints/options/components/OptionBlock'
import { setStored, useStorage } from '@/shared/storage'
import type { LinkInfo } from '@/features/useful-links/links'
import { links } from '@/features/useful-links/links'

import LinkSetting from '@/entrypoints/options/components/LinkSetting'
import AboutSection from '@/entrypoints/options/components/AboutSection'
import { AutologinToggle } from '@/features/autologin/AutologinToggle'

export default function Options() {
  const pinnedLinks = JSON.parse(useStorage('pinnedLinks') ?? '{}') as Record<string, LinkInfo>
  const pinnedValues = Object.values(pinnedLinks)

  const toggleLink = (link: LinkInfo) => {
    const isPinned = !!pinnedLinks[link.title]

    if (isPinned) {
      delete pinnedLinks[link.title]
      setStored('pinnedLinks', JSON.stringify(pinnedLinks))
    }
    else {
      pinnedLinks[link.title] = link
      setStored('pinnedLinks', JSON.stringify(pinnedLinks))
    }
  }

  return (
    <div className="flex text-base">
      <NavigationPanel />
      <div className="px-20 py-10">
        <h1 className="my-10 w-full text-4xl font-semibold">Options Page</h1>
        <AboutSection />
        <OptionBlock title="Quick Links" id="links">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-base">Pinned services</p>
              {pinnedValues.length > 0 && (
                pinnedValues.map(link => (
                  <LinkSetting key={link.href} title={link.title} className={link.className} pinned={!!pinnedLinks[link.title]} onClick={() => toggleLink(link)} />
                ))
              )}

              {pinnedValues.length === 0 && (
                <div className="text-sm text-gray-500">No pinned services</div>
              )}
            </div>

            <div>
              <p className="mb-2 text-base">Unpinned services</p>
              {links.filter(link => !pinnedLinks[link.title]).map(link => (
                <LinkSetting key={link.href} title={link.title} className={link.className} pinned={!!pinnedLinks[link.title]} onClick={() => toggleLink(link)} />
              ))}
            </div>
          </div>
        </OptionBlock>
        <OptionBlock title="Enable Features" id="features">
          <AutologinToggle increased />
        </OptionBlock>
      </div>
    </div>
  )
}
