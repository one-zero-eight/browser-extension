import type { ReactNode } from 'react'
import { useState } from 'react'
import { SearchField } from './SearchField'
import { useCourses } from '@/features/courses/useCourses'
import { links } from '@/features/useful-links/links'
import { cn } from '@/shared/ui/utils'

interface SearchResult {
  title: string
  href: string
  icon: string
}

/** Every whitespace-separated word of the query must appear in the text. */
function matches(text: string, query: string) {
  const haystack = text.toLowerCase()
  return query.toLowerCase().split(/\s+/).filter(Boolean).every(word => haystack.includes(word))
}

/**
 * Search field that filters services and Moodle courses locally.
 * While the query is empty, `children` (the regular popup content) is shown instead of results.
 */
export function Search({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')
  const { courses } = useCourses('all')
  const trimmed = query.trim()

  const services: SearchResult[] = trimmed
    ? links
      .filter(link => matches(link.title, trimmed))
      .map(link => ({ title: link.title, href: link.href, icon: link.className }))
    : []
  const courseResults: SearchResult[] = trimmed
    ? (courses ?? [])
        .filter(course => matches(course.fullname, trimmed))
        .map(course => ({ title: course.fullname, href: course.url, icon: 'icon-[material-symbols--school-outline-rounded]' }))
    : []
  const first = services[0] ?? courseResults[0]

  return (
    <>
      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={() => first && chrome.tabs.create({ url: first.href })}
      />
      {!trimmed
        ? children
        : services.length === 0 && courseResults.length === 0
          ? <div className="px-4 pt-4 text-sm text-base-content/50">Nothing found.</div>
          : (
            <>
              <ResultsSection title="Services" results={services} first={first} />
              <ResultsSection title="Moodle courses" results={courseResults} first={first} />
            </>
            )}
    </>
  )
}

function ResultsSection({ title, results, first }: {
  title: string
  results: SearchResult[]
  first?: SearchResult
}) {
  if (results.length === 0)
    return null

  return (
    <section className="px-4 pt-4">
      <h2 className="mb-2 mt-0 text-xs font-semibold tracking-wide text-base-content/50 uppercase">{title}</h2>
      <div className="overflow-hidden rounded-box bg-base-200">
        {results.map(result => (
          <a
            key={result.href}
            href={result.href}
            target="_blank"
            rel="noreferrer noopener"
            title={result.title}
            className={cn(
              'group flex items-center gap-2.5 border-t border-base-300 px-3 py-2 text-sm text-base-content no-underline first:border-t-0 hover:text-primary',
              result === first && 'bg-base-300',
            )}
          >
            <span className={cn(result.icon, 'shrink-0 text-lg text-base-content/50 group-hover:text-primary')} />
            <span className="min-w-0 flex-1 truncate">{result.title}</span>
            {result === first && <kbd className="kbd kbd-xs">Enter</kbd>}
          </a>
        ))}
      </div>
    </section>
  )
}
