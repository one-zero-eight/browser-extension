function applyTheme() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function initTheme() {
  applyTheme()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
}
