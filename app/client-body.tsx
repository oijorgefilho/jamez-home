'use client'

import { useEffect } from 'react'

export function ClientBody({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Any client-side-only logic can go here
  }, [])

  return <>{children}</>
}

