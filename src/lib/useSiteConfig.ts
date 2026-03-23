import { useEffect, useState } from 'react'
import { createAnonClient } from '@/lib/supabase'

/**
 * Fetches a site config value from the `site_config` Supabase table.
 * The table has columns: key TEXT (primary key), value TEXT.
 *
 * To update the value, go to Supabase dashboard → Table Editor → site_config
 * and edit the row with key = `weekly_users`.
 */
export function useSiteConfig(key: string, fallback: string): string {
  const [value, setValue] = useState(fallback)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const client = createAnonClient()
        const { data } = await client
          .from('site_config')
          .select('value')
          .eq('key', key)
          .maybeSingle()
        if (!cancelled && data?.value) {
          setValue(String(data.value))
        }
      } catch {
        // silently fall back to default
      }
    }
    void fetch()
    return () => {
      cancelled = true
    }
  }, [key])

  return value
}
