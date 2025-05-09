import { Tooltip } from '@/features/useful-links/Tooltip'
import { cn } from '@/shared/ui/utils'

export function UsefulLinksSection() {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      <LinkButton title="Dashboard" href="https://innohassle.ru/dashboard" className="i-material-symbols-space-dashboard-outline" />
      <LinkButton title="Calendar" href="https://innohassle.ru/calendar" className="i-material-symbols-calendar-month-outline-rounded" />
      <LinkButton title="Maps" href="https://innohassle.ru/maps" className="i-material-symbols-map-outline" />
      <LinkButton title="Room booking" href="https://innohassle.ru/room-booking" className="i-ph-door-open" />
      <LinkButton title="Moodle" href="https://moodle.innopolis.university/my/" className="i-material-symbols-school-outline-rounded" />
      <LinkButton title="Sport" href="https://sport.innopolis.university/profile/" className="i-material-symbols-exercise-outline" />
      <LinkButton title="My University" href="https://my.university.innopolis.ru" className="i-material-symbols-account-circle-outline" />
      <LinkButton title="Innopoints" href="https://my.innopolis.university/event" className="i-material-symbols-loyalty-outline-rounded" />
      <LinkButton title="Mail" href="https://mail.innopolis.ru" className="i-material-symbols-mail-outline-rounded" />
      <LinkButton title="Library" href="https://portal.university.innopolis.ru/reading_hall/" className="i-material-symbols-book-2-outline" />
      <LinkButton title="Music room" href="https://innohassle.ru/music-room" className="i-material-symbols-piano" />
      <LinkButton title="Dormitory" href="https://hotel.innopolis.university/studentaccommodation/#block2944" className="i-material-symbols-night-shelter-outline-rounded" />
      <LinkButton title="Eduwiki" href="https://eduwiki.innopolis.university" className="i-streamline-quality-education" />
      <LinkButton title="Baam" href="https://baam.tatar" className="i-material-symbols-qr-code-rounded" />
    </div>
  )
}

function LinkButton({
  href,
  title,
  className,
}: {
  href: string
  title: string
  className?: string
}) {
  return (
    <Tooltip content={title} className="h-fit w-fit flex shrink-0">
      <a
        href={href}
        target="_blank"
        className={cn(
          'shrink-0 text-3xl rounded-full p-2 hover:bg-blue-500',
          className,
        )}
      />
    </Tooltip>
  )
}
