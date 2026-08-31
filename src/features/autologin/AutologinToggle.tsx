import { setStored, useStorage } from '@/shared/storage'
import { cn } from '@/shared/ui/utils'

export function AutologinToggle({ increased = false }: { increased?: boolean }) {
  const autologinEnabled = useStorage('autologinEnabled')
  const enabled = autologinEnabled !== false

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4',
        increased ? 'px-5 py-4' : 'border-t border-base-300 px-4 py-2.5',
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium">Moodle autologin</div>
        <div className="mt-0.5 text-xs text-base-content/50">
          Sign in without entering your password
        </div>
      </div>
      <input
        type="checkbox"
        className={cn(
          'toggle toggle-primary',
          increased && 'text-white',
        )}
        checked={enabled}
        aria-label="Moodle autologin"
        onChange={() => setStored('autologinEnabled', !enabled)}
      />
    </div>
  )
}
