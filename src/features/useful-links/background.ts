import { getStored, setStored } from '@/shared/storage'
import type { LinkInfo } from '@/features/useful-links/links'
import { links } from '@/features/useful-links/links'

export async function initializeUsefulLinksIfNeeded() {
  const stored = await getStored('pinnedLinks')

  if (!stored) {
    console.log('Initializing useful links...')
    const initial = links.reduce((init, link) => {
      init[link.title] = link
      return init
    }, {} as Record<string, LinkInfo>)

    await setStored('pinnedLinks', JSON.stringify(initial))
  }
}
