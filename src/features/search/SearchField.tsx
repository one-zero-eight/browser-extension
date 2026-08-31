import { useState } from 'react'

export function SearchField() {
  const [text, setText] = useState('')

  return (
    <form
      className="flex items-center gap-2 px-4 pt-4"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const query = text.trim()
        if (!query)
          return

        const url = new URL('https://innohassle.ru/search')
        url.searchParams.append('q', query)
        chrome.tabs.create({ url: url.toString() })
      }}
    >
      <div className="relative min-w-0 flex-1">
        <span className="icon-[material-symbols--search-rounded] pointer-events-none absolute top-1/2 left-3 text-lg text-base-content/50 -translate-y-1/2" />
        <input
          autoComplete="off"
          spellCheck={false}
          className="h-10 w-full rounded-field border border-primary bg-base-100 caret-primary py-0 pr-3 pl-9 text-sm outline-hidden"
          placeholder="Search InNoHassle"
          aria-label="Search InNoHassle"
          onChange={e => setText(e.target.value)}
          value={text}
          autoFocus
        />
      </div>
      <button type="submit" disabled={!text.trim()} className="btn btn-primary h-10">
        Search
      </button>
    </form>
  )
}
