export function TopBar() {
  return (
    <div className="h-12 flex items-center justify-between bg-black p-2">
      <div className="text-xl">InNoHassle Extension</div>
      <button type="button" onClick={() => chrome.runtime.openOptionsPage()} className="i-material-symbols-settings-rounded text-xl" />
    </div>
  )
}
