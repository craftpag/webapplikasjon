type ClassValue = string | false | null | undefined

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string, locale = 'nb-NO'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(
    new Date(date),
  )
}
