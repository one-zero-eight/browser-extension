export default function NavigationPanel() {
  return (
    <nav className="sticky top-0 h-screen w-60 flex shrink-0 flex-col self-start bg-[#0b0b0b]">
      <h2 className="mx-5 mb-5 cursor-default border-b-1 border-b-[#9747FF] border-b-solid py-7 text-xl text-white font-semibold decoration-none transition-500">InNoHassle Tools </h2>
      <NavigationLink href="#links" title="Quick Links" />
      <NavigationLink href="#features" title="Enable Features" />
    </nav>
  )
}

function NavigationLink({ href, title }: { href: string, title: string }) {
  return <a href={href} className="p-5 text-white decoration-none hover:underline">{title}</a>
}
