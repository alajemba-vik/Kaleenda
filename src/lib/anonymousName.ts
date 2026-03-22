const adjectives = [
  'Silent',
  'Brave',
  'Mellow',
  'Curious',
  'Swift',
  'Bright',
  'Gentle',
  'Calm',
  'Lucky',
  'Nimble',
] as const

const nouns = [
  'Penguin',
  'Koala',
  'Fox',
  'Mango',
  'Otter',
  'Falcon',
  'River',
  'Comet',
  'Willow',
  'Cedar',
] as const

export function randomAnonymousName(): string {
  const a = adjectives[Math.floor(Math.random() * adjectives.length)]
  const n = nouns[Math.floor(Math.random() * nouns.length)]
  return `${a} ${n}`
}

