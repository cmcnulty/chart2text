import { Chart2TextOptions } from '../types';

/**
 * Formats a number according to the provided options
 *
 * @param num - Number to format
 * @param options - Formatting options
 * @param currency - Optional currency code (USD, EUR, etc.)
 * @returns Formatted string representation
 */
export function formatNumber(
  num: number,
  options: Chart2TextOptions,
  currency?: string
): string {
  if (currency) {
    // Format as currency
    const formatter = new Intl.NumberFormat(options.locale || 'en', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(num);
  }

  if (options.useRounding !== false) {
    // Apply "natural" rounding for readability
    if (Math.abs(num) < 0.1) return num.toFixed(options.precision || 2);
    if (Math.abs(num) < 1) return num.toFixed(2);
    if (Math.abs(num) < 10) return num.toFixed(1);
    return Math.round(num).toString();
  }

  return num.toFixed(options.precision || 2);
}
