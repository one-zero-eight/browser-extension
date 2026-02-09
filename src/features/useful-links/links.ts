export interface LinkInfo {
  title: string
  href: string
  className: string
}

export const links: LinkInfo[] = [
  {
    title: 'Dashboard',
    href: 'https://innohassle.ru/dashboard',
    className: 'i-material-symbols-space-dashboard-outline',
  },
  {
    title: 'Calendar',
    href: 'https://innohassle.ru/calendar',
    className: 'i-material-symbols-calendar-month-outline-rounded',
  },
  {
    title: 'Maps',
    href: 'https://innohassle.ru/maps',
    className: 'i-material-symbols-map-outline',
  },
  {
    title: 'Room booking',
    href: 'https://innohassle.ru/room-booking',
    className: 'i-ph-door-open',
  },
  {
    title: 'Clubs',
    href: 'https://innohassle.ru/clubs',
    className: 'i-material-symbols-diversity-1-rounded',
  },
  {
    title: 'Printers',
    href: 'https://t.me/InnoPrintBot',
    className: 'i-material-symbols-print-outline-rounded',
  },
  {
    title: 'Moodle',
    href: 'https://moodle.innopolis.university/my/',
    className: 'i-material-symbols-school-outline-rounded',
  },
  {
    title: 'Sport',
    href: 'https://sport.innopolis.university/profile/',
    className: 'i-material-symbols-exercise-outline',
  },
  {
    title: 'My University',
    href: 'https://my.university.innopolis.ru',
    className: 'i-material-symbols-account-circle-outline',
  },
  {
    title: 'Innopoints',
    href: 'https://my.innopolis.university/event',
    className: 'i-material-symbols-loyalty-outline-rounded',
  },
  {
    title: 'Mail',
    href: 'https://mail.innopolis.ru',
    className: 'i-material-symbols-mail-outline-rounded',
  },
  {
    title: 'Library',
    href: 'https://portal.university.innopolis.ru/reading_hall/',
    className: 'i-material-symbols-book-2-outline',
  },
  {
    title: 'Music room',
    href: 'https://innohassle.ru/music-room',
    className: 'i-material-symbols-piano',
  },
  {
    title: 'Dormitory',
    href: 'https://hotel.innopolis.university/studentaccommodation/#block2944',
    className: 'i-material-symbols-night-shelter-outline-rounded',
  },
  {
    title: 'Dorms bot',
    href: 'https://t.me/IURoomsBot',
    className: 'i-material-symbols-nest-multi-room-outline-rounded',
  },
  {
    title: 'Eduwiki',
    href: 'https://eduwiki.innopolis.university',
    className: 'i-streamline-quality-education',
  },
  {
    title: 'Baam',
    href: 'https://baam.tatar',
    className: 'i-material-symbols-qr-code-rounded',
  },
  {
    title: 'Timer',
    href: 'https://innohassle.ru/timer',
    className: 'i-material-symbols-timer-outline-rounded',
  },
]

export const linksIndexMap = links.reduce(
  (map, link) => {
    map[link.title] = link
    return map
  },
  {} as Record<string, LinkInfo>,
)
