import { endOfQuarter } from 'date-fns'

export function getQuarterLastDate(date: Date): Date {
  return endOfQuarter(date)
}