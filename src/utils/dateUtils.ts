import { format, parse, Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

const locales: { [key: string]: Locale } = {
  en: enUS,
  es: es,
};

/**
 * Formats a date string to display format (Month Year)
 */
export function formatDisplayDate(dateString: string | null, language: string = 'en'): string {
  if (!dateString) return '';
  try {
    const date = parse(dateString, 'yyyy-MM', new Date(), { locale: locales[language] });
    return format(date, 'MMMM yyyy', { locale: locales[language] });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Formats a date to storage format (YYYY-MM)
 */
export function formatStorageDate(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Validates if a date string is in the correct format (YYYY-MM)
 */
export function isValidDateFormat(dateString: string): boolean {
  return /^\d{4}-\d{2}$/.test(dateString);
}

/**
 * Calculates duration in years between two dates
 */
export function calculateDurationYears(startDate: string, endDate: string | null, isCurrent: boolean = false): number {
  const start = parse(startDate, 'yyyy-MM', new Date());
  const end = isCurrent ? new Date() : (endDate ? parse(endDate, 'yyyy-MM', new Date()) : new Date());
  
  const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.round((diffInMonths / 12) * 10) / 10; // Round to 1 decimal place
}

/**
 * Gets the current date in storage format (YYYY-MM)
 */
export function getCurrentDate(): string {
  return formatStorageDate(new Date());
} 