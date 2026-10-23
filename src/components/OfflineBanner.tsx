import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/lib/online'

/**
 * Sits at the top of the app shell. The PWA keeps the UI available offline;
 * this tells the user why saves and loads are not happening.
 */
export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm text-warning-foreground"
    >
      <WifiOff className="size-4" aria-hidden />
      <span>You're offline. Changes will not be saved until you reconnect.</span>
    </div>
  )
}
