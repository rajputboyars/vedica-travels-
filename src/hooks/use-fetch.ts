'use client'
import { useCallback, useEffect, useState } from 'react'

// Nearly every admin/client page in this app did the same
// `useState + useEffect + fetch + setLoading` dance. Centralizing it here
// removes that duplication and gives every list page a `refetch()` for
// free after a mutation, instead of re-declaring the fetch function.
export function useFetch<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    // Intentional fetch-on-mount/url-change. This is the standard
    // "synchronize with an external system" case the rule's docs carve
    // out — there's no React state driving the request, just the URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch()
  }, [refetch])

  return { data, setData, loading, error, refetch }
}
