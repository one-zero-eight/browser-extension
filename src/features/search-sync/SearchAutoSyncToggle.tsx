import { sendMessage } from '@/shared/messages'
import { removeStored, setStored, useStorage } from '@/shared/storage'
import { cn } from '@/shared/ui/utils'

export function SearchAutoSyncToggle() {
  const allowSendingCourses = useStorage('allowSyncingCourses')

  return (
    <div className="w-full flex flex-row items-center justify-between gap-2 p-2">
      <div className="flex items-center text-xs">
        Sync your Moodle courses contents with InNoHassle Search for indexing and using AI search engine
      </div>
      <button
        type="button"
        className={cn(
          'flex h-fit items-center justify-center rounded-lg px-2 py-1 text-xs font-normal text-base-content',
          allowSendingCourses === false ? 'bg-red-900' : 'bg-[#9747FF] hover:bg-[#6600CC]',
        )}
        onClick={() => {
          const shouldAllow = !allowSendingCourses
          setStored('allowSyncingCourses', shouldAllow)
          removeStored('syncCoursesLastUpdateMS')
          sendMessage(shouldAllow ? 'REQUEST_SYNC' : 'STOP_SYNC')
        }}
      >
        {allowSendingCourses === false ? 'OFF' : 'ON'}
      </button>
    </div>
  )
}
