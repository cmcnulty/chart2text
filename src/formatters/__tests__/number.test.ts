import { formatNumber } from '../number';
import { Chart2TextOptions } from '../../types';

describe('formatNumber', () => {
  describe('currency formatting', () => {
    it('should format USD currency', () => {
      const options: Chart2TextOptions = { locale: 'en' };
      expect(formatNumber(1000, options, 'USD')).toBe('$1,000.00');
    });

    it('should format EUR currency', () => {
      const options: Chart2TextOptions = { locale: 'en' };
      expect(formatNumber(1000, options, 'EUR')).toBe('€1,000.00');
    });

    it('should respect locale for currency formatting', () => {
      const options: Chart2TextOptions = { locale: 'de-DE' };
      const result = formatNumber(1000, options, 'EUR');
      // German locale uses different number formatting
      expect(result).toContain('1');
      expect(result).toContain('000');
    });
  });

  describe('natural rounding', () => {
    it('should round large numbers (>= 10) to nearest integer', () => {
      const options: Chart2TextOptions = { useRounding: true };
      expect(formatNumber(42.7, options)).toBe('43');
      expect(formatNumber(99.4, options)).toBe('99');
      expect(formatNumber(100.5, options)).toBe('101');
    });

    it('should keep 1 decimal place for small numbers (< 10)', () => {
      const options: Chart2TextOptions = { useRounding: true };
      expect(formatNumber(5.67, options)).toBe('5.7');
      expect(formatNumber(9.99, options)).toBe('10.0');
      expect(formatNumber(3.14159, options)).toBe('3.1');
    });

    it('should format integers without decimals', () => {
      const options: Chart2TextOptions = { useRounding: true };
      expect(formatNumber(42, options)).toBe('42');
      expect(formatNumber(100, options)).toBe('100');
    });
  });

  describe('precision formatting', () => {
    it('should use specified precision when rounding is disabled', () => {
      const options: Chart2TextOptions = { useRounding: false, precision: 2 };
      expect(formatNumber(3.14159, options)).toBe('3.14');
    });

    it('should respect custom precision', () => {
      const options: Chart2TextOptions = { useRounding: false, precision: 4 };
      expect(formatNumber(3.14159, options)).toBe('3.1416');
    });

    it('should use default precision of 2 when not specified', () => {
      const options: Chart2TextOptions = { useRounding: false };
      expect(formatNumber(3.14159, options)).toBe('3.14');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      const options: Chart2TextOptions = { useRounding: true };
      // Zero is formatted with default precision
      expect(formatNumber(0, options)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      const options: Chart2TextOptions = { useRounding: true };
      expect(formatNumber(-42.7, options)).toBe('-43');
      expect(formatNumber(-5.67, options)).toBe('-5.7');
    });

    it('should handle very large numbers', () => {
      const options: Chart2TextOptions = { useRounding: true };
      expect(formatNumber(1000000, options)).toBe('1000000');
    });

    it('should handle very small numbers', () => {
      const options: Chart2TextOptions = { useRounding: false, precision: 4 };
      expect(formatNumber(0.0001, options)).toBe('0.0001');
    });
  });

  describe('default behavior', () => {
    it('should use rounding by default', () => {
      const options: Chart2TextOptions = {};
      expect(formatNumber(42.7, options)).toBe('43');
    });

    it('should use en locale by default', () => {
      const options: Chart2TextOptions = {};
      const result = formatNumber(1000, options, 'USD');
      expect(result).toBe('$1,000.00');
    });
  });
});
