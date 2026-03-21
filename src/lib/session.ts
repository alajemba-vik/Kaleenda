export async function exchangeSessionJwt(sessionToken: string): Promise<string> {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_token: sessionToken }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? 'Could not verify session')
  }
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}
