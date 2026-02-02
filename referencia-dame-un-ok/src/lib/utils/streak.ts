/**
 * Pure function to calculate streak from an array of date strings.
 * Extracted from services/streak.ts for testability.
 */
export function calculateStreakFromDates(checkInDates: string[], today?: Date): number {
  if (!checkInDates || checkInDates.length === 0) return 0

  // Deduplicate by day
  const dates = [...new Set(checkInDates.map(d => {
    const date = new Date(d)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }))].sort().reverse()

  let count = 0
  const ref = today || new Date()
  let expected = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate())

  for (const dateStr of dates) {
    const [y, m, d] = dateStr.split('-').map(Number)
    const checkDate = new Date(y, m - 1, d)
    const diff = Math.round((expected.getTime() - checkDate.getTime()) / 86400000)
    if (diff === 0) {
      count++
      expected = new Date(expected.getTime() - 86400000)
    } else if (diff === 1 && count === 0) {
      // Yesterday counts as start of streak
      count++
      expected = new Date(checkDate.getTime() - 86400000)
    } else {
      break
    }
  }

  return count
}
