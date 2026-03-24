import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const resendFrom = Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev'
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { record } = await req.json() // This is the payload from the Webhook: inserted event

    if (!record || !record.calendar_id) {
      return new Response(JSON.stringify({ error: 'No record provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Get calendar metadata to know the name
    const { data: cal } = await supabase
      .from('calendars')
      .select('name, public_id')
      .eq('id', record.calendar_id)
      .single()

    if (!cal) {
      return new Response(JSON.stringify({ error: 'Calendar not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // 2. Fetch all subscribers who want to be notified on new events
    const { data: subs, error: subErr } = await supabase
      .from('subscriptions')
      .select('email, notify_on_new, id')
      .eq('calendar_id', record.calendar_id)
      .eq('notify_on_new', true)

    if (subErr) throw subErr

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscribers to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Send emails via Resend
    const calUrl = `https://kaleenda.vercel.app/cal/${cal.public_id}`
    
    // Vercel deployment would require the app URL to be passed in env or guessed. 
    // We will assume kaleenda.vercel.app for now as requested in the webcal link earlier.
    const unsubscribeUrlFn = (subId: string) => `https://bptzbtgjurwtkhnwjurz.supabase.co/functions/v1/email-unsubscribe?id=${subId}`

    const emailPromises = subs.map((sub) => {
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1916;">New event added to ${cal.name || 'your calendar'}</h2>
          <div style="background: #f5f0e8; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${record.title}</p>
            <p style="margin: 8px 0 0; color: #666;">
              When: ${record.event_date} ${record.start_time ? `at ${record.start_time}` : ''}
              <br/>
              Added by: ${record.creator_name}
            </p>
          </div>
          <a href="${calUrl}" style="display: inline-block; background: #3d6fff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Calendar</a>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0 20px;" />
          <p style="font-size: 12px; color: #888;">
            You received this because you subscribed to updates for this calendar.
            <br/>
            <a href="${unsubscribeUrlFn(sub.id)}" style="color: #888;">Unsubscribe</a> from future notifications.
          </p>
        </div>
      `

      return fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: resendFrom,
          to: sub.email,
          subject: `New Event: ${record.title} added to ${cal.name}`,
          html,
        }),
      })
    })

    await Promise.allSettled(emailPromises)

    return new Response(JSON.stringify({ message: `Notified ${subs.length} subscribers` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
