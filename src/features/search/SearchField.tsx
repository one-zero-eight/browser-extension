export function SearchField({ value, onChange, onSubmit }: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}) {
  return (
    <form
      className="px-4 pt-4"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className="relative">
        <span className="icon-[material-symbols--search-rounded] pointer-events-none absolute top-1/2 left-3 text-lg text-base-content/50 -translate-y-1/2" />
        <input
          autoComplete="off"
          spellCheck={false}
          className="h-10 w-full rounded-field border border-primary bg-base-100 caret-primary py-0 pr-3 pl-9 text-sm outline-hidden"
          placeholder="Search services and courses"
          aria-label="Search services and courses"
          onChange={e => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && value) {
              e.preventDefault()
              onChange('')
            }
          }}
          value={value}
          autoFocus
        />
      </div>
    </form>
  )
}
