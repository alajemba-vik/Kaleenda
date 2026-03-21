/** Monday = 0 .. Sunday = 6 */
export function weekdayMon0(d: Date): number {
  const w = d.getDay()
  return w === 0 ? 6 : w - 1
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

/** Six weeks starting Monday of the week that contains the 1st of `anchor`'s month */
export function monthGrid(anchor: Date): Date[][] {
  const first = startOfMonth(anchor)
  const start = new Date(first)
  start.setDate(first.getDate() - weekdayMon0(first))

  const weeks: Date[][] = []
  const cur = new Date(start)

  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

export function formatMonthTitle(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}
