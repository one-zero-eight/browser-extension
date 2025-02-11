import { cn } from '@/shared/ui/utils'

export function UsefulLinksSection() {
  return (
    <div className="flex gap-2 p-2">
      <LinkButton href="https://innohassle.ru/dashboard" className="i-material-symbols-space-dashboard-outline" />
      <LinkButton href="https://innohassle.ru/calendar" className="i-material-symbols-calendar-month-outline-rounded" />
      <LinkButton href="https://innohassle.ru/maps" className="i-material-symbols-map-outline" />
      <LinkButton href="https://innohassle.ru/room-booking" className="i-ph-door-open" />
      <LinkButton href="https://moodle.innopolis.university/my/" className="i-material-symbols-school-outline-rounded" />
      <LinkButton href="https://sport.innopolis.university/profile/" className="i-material-symbols-exercise-outline" />
      <LinkButton href="https://my.university.innopolis.ru" className="i-material-symbols-account-circle-outline" />
      <LinkButton href="https://my.innopolis.university/event" className="i-material-symbols-loyalty-outline-rounded" />
      <LinkButton href="https://mail.innopolis.ru" className="i-material-symbols-mail-outline-rounded" />
      <LinkButton href="https://portal.university.innopolis.ru/reading_hall/" className="i-material-symbols-book-2-outline" />
      <LinkButton href="https://innohassle.ru/music-room" className="i-material-symbols-piano" />
      <LinkButton href="https://hotel.innopolis.university/studentaccommodation/#block2944" className="i-material-symbols-night-shelter-outline-rounded" />
      <LinkButton href="https://eduwiki.innopolis.university" className="i-streamline-quality-education" />
      <LinkButton href="https://baam.tatar" className="i-material-symbols-qr-code-rounded" />
    </div>
  )
}

function LinkButton({
  href,
  className,
}: {
  href: string
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      className={cn(
        'rounded-full p-2 text-3xl hover:bg-blue-500',
        className,
      )}
    />
  )
}
