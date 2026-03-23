import '@/styles/marketingPages.css'
import { ReactNode } from 'react'
import { SiteHeader } from '@/components/SiteHeader'

export function MarketingLayout({ children }: { children: ReactNode }) {

  return (
    <div className="mp-page">
      <SiteHeader />

      {children}
    </div>
  )
}
