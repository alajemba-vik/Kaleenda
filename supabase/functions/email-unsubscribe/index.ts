import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const url = new URL(req.url)
  const subId = url.searchParams.get('id')

  if (!subId) {
    return new Response('Invalid unsubscribe link', { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await supabase.from('subscriptions').delete().eq('id', subId)

    if (error) throw error

    return new Response(
      `
      <html>
        <head><title>Unsubscribed</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f9f9f9;}</style></head>
        <body>
          <div style="background:white;padding:40px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;">
             <h1 style="margin:0 0 16px;font-size:24px;">You have been unsubscribed</h1>
             <p style="color:#666;margin:0;">You will no longer receive emails for this calendar.</p>
          </div>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
})
