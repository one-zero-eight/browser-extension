export default function AboutSection() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1 pb-4">
      <p className="m-0 text-xs text-base-content/50">
        Quick access to university services, Moodle courses and file downloads.
      </p>
      <div className="flex gap-4">
        <a href="https://innohassle.ru/extension" target="_blank" rel="noreferrer noopener" className="link link-primary text-xs no-underline hover:underline">
          Extension page
        </a>
        <a href="https://github.com/one-zero-eight/browser-extension" target="_blank" rel="noreferrer noopener" className="link link-primary text-xs no-underline hover:underline">
          GitHub
        </a>
      </div>
    </div>
  )
}
