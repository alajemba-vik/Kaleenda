/// <reference types="vite/client" />

declare module 'html2canvas' {
  type Html2CanvasOptions = {
    backgroundColor?: string | null
    scale?: number
    useCORS?: boolean
  }

  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions,
  ): Promise<HTMLCanvasElement>
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_EMAIL_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
