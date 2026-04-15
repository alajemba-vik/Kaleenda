import { useState } from 'react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { PlushieCharacter } from '@/features/marketing'
import './ContactPage.css'

type FormState = 'idle' | 'sending' | 'success' | 'error'

export function ContactPage() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    setErrorMsg(null)

    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Something went wrong')
      }
      setState('success')
    } catch (err) {
      // Log full error for debugging
      console.error('Contact form error:', err)
      // Show generic message to user
      setErrorMsg('Unable to send message. Please try again in a moment.')
      setState('error')
    }
  }

  return (
    <MarketingLayout>
      <div className="contact-page">
        <div className="contact-hero">
          <div className="contact-mascot" aria-hidden="true">
            <PlushieCharacter mood="chill" size={80} />
          </div>
          <h1 className="contact-title">Get in touch</h1>
          <p className="contact-sub">
            Have a question, feedback, or just want to say hi?<br />
            We'd love to hear from you.
          </p>
        </div>

        <div className="contact-card">
          {state === 'success' ? (
            <div className="contact-success">
              <span className="contact-success-icon" aria-hidden="true">
                <PlushieCharacter mood="celebration" size={64} />
              </span>
              <h2>Message sent!</h2>
              <p>Thanks for reaching out. We'll get back to you soon.</p>
              <button
                className="btn"
                type="button"
                onClick={() => setState('idle')}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              {state === 'error' && errorMsg && (
                <p className="contact-error">{errorMsg}</p>
              )}
              <div className="contact-form-row">
                <label className="contact-label" htmlFor="contact-name">
                  Your name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  className="field"
                  placeholder="Jane Smith"
                  required
                  disabled={state === 'sending'}
                />
              </div>
              <div className="contact-form-row">
                <label className="contact-label" htmlFor="contact-email">
                  Your email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="field"
                  placeholder="jane@example.com"
                  required
                  disabled={state === 'sending'}
                />
              </div>
              <div className="contact-form-row">
                <label className="contact-label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="field"
                  rows={6}
                  placeholder="What's on your mind?"
                  required
                  disabled={state === 'sending'}
                />
              </div>
              <button
                className="btn contact-btn"
                type="submit"
                disabled={state === 'sending'}
              >
                {state === 'sending' ? 'Sending…' : 'Send message →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </MarketingLayout>
  )
}
