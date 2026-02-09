import { setStored, useStorage } from '@/shared/storage'
import { cn } from '@/shared/ui/utils'

export function AutologinToggle({ increased = false }: { increased?: boolean }) {
  const autologinEnabled = useStorage('autologinEnabled')

  return (
    <div className="w-full flex flex-row items-center justify-between gap-2 p-2">
      <div className={`flex items-center ${increased ? '' : 'text-xs'}`}>
        Enable autologin on Moodle (without entering your password)
      </div>
      <button
        type="button"
        className={cn(
          `flex h-fit items-center justify-center rounded-lg ${increased ? 'px-3 py-2' : 'text-xs px-2 py-1'} font-normal text-base-content`,
          autologinEnabled === false ? 'bg-red-900' : 'bg-[#9747FF] hover:bg-[#6600CC]',
        )}
        onClick={() => {
          setStored('autologinEnabled', !autologinEnabled)
        }}
      >
        {autologinEnabled === false ? 'OFF' : 'ON'}
      </button>
    </div>
  )
}
