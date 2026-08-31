export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <img src="/icons/logo.svg" alt="" className="size-8 shrink-0" />
        <div className="min-w-0">
          <div className="text-base leading-5 font-semibold">InNoHassle</div>
          <div className="text-xs leading-4 text-base-content/50">University tools</div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a
          href="https://innohassle.ru"
          target="_blank"
          rel="noreferrer noopener"
          className="btn btn-ghost btn-sm"
        >
          Website
          <span className="icon-[material-symbols--open-in-new-rounded] text-base" />
        </a>
        <button
          type="button"
          title="Settings"
          aria-label="Open extension settings"
          onClick={() => chrome.runtime.openOptionsPage()}
          className="btn btn-ghost btn-square btn-sm"
        >
          <span className="icon-[material-symbols--settings-rounded] text-xl" />
        </button>
      </div>
    </header>
  )
}
