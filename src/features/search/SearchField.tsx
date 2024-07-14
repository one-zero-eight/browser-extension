import { useState } from 'react'

export function SearchField() {
  const [text, setText] = useState('')
  return (
    <form
      className="flex flex-row gap-2 p-2"
      onSubmit={(e) => {
        e.preventDefault()
        const url = new URL('https://innohassle.ru/search')
        url.searchParams.append('q', text)
        chrome.tabs.create({ url: url.toString() })
      }}
    >
      <input
        autoComplete="off"
        spellCheck={false}
        className="caret-focus bg-base border-focus text-base-content inset-0 h-10 w-full resize-none rounded-lg p-3 text-base outline-none dark:text-white"
        placeholder="Search anything"
        onChange={e => setText(e.target.value)}
        value={text}
        autoFocus
      />
      <button
        type="submit"
        className="btn-primary h-10 w-[93px] flex items-center justify-center gap-2 rounded-lg bg-[#9747FF] px-2 py-1 text-base text-white font-normal leading-6 hover:bg-[#6600CC]"
      >
        <span className="i-material-symbols-search-rounded h-4 w-4" />
        Search
      </button>
    </form>
  )
}
