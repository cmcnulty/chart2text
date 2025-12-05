import { describeBarChart } from '../bar';
import { Chart2TextOptions } from '../../types';

describe('describeBarChart', () => {
  const defaultOptions: Chart2TextOptions = {
    datasetLabel: 'Test Data',
    locale: 'en',
    useRounding: true,
    precision: 2
  };

  describe('basic descriptions', () => {
    it('should describe a simple bar chart', () => {
      const labels = ['A', 'B', 'C', 'D'];
      const values = [10, 20, 15, 25];
      const description = describeBarChart(labels, values, defaultOptions);

      expect(description).toContain('4 categories');
      expect(description).toContain('10');
      expect(description).toContain('25');
    });

    it('should identify min and max values', () => {
      const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      const values = [100, 150, 90, 120];
      const description = describeBarChart(labels, values, defaultOptions);

      expect(description).toContain('90');
      expect(description).toContain('150');
    });
  });

  describe('small datasets (≤5 items)', () => {
    it('should list all values for small datasets', () => {
      const labels = ['A', 'B', 'C'];
      const values = [10, 20, 30];
      const description = describeBarChart(labels, values, defaultOptions);

      expect(description).toContain('A');
      expect(description).toContain('B');
      expect(description).toContain('C');
      expect(description).toContain('10');
      expect(description).toContain('20');
      expect(description).toContain('30');
    });
  });

  describe('large datasets (>5 items)', () => {
    it('should show notable values for large datasets', () => {
      const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const values = [10, 20, 30, 15, 25, 35, 5, 40];
      const description = describeBarChart(labels, values, defaultOptions);

      // Should mention first
      expect(description).toContain('A');
      // Should mention max
      expect(description).toContain('40');
      // Should mention min
      expect(description).toContain('5');
      // Should mention last
      expect(description).toContain('H');
    });
  });

  describe('pie chart mode', () => {
    it('should sort pie slices by default', () => {
      const labels = ['Small', 'Large', 'Medium'];
      const values = [10, 100, 50];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        sortPieSlices: true
      };
      const description = describeBarChart(labels, values, options, 'pie');

      // Check that values section lists them in sorted order (largest to smallest)
      // "The values are: Large at 100, Medium at 50, Small at 10"
      const valuesSection = description.substring(description.indexOf('values are:'));
      expect(valuesSection.indexOf('Large')).toBeLessThan(valuesSection.indexOf('Medium'));
      expect(valuesSection.indexOf('Medium')).toBeLessThan(valuesSection.indexOf('Small'));
    });

    it('should preserve order when sortPieSlices is false', () => {
      const labels = ['First', 'Second', 'Third'];
      const values = [10, 100, 50];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        sortPieSlices: false
      };
      const description = describeBarChart(labels, values, options, 'pie');

      // Check that values section lists them in original order
      const valuesSection = description.substring(description.indexOf('values are:'));
      expect(valuesSection.indexOf('First')).toBeLessThan(valuesSection.indexOf('Second'));
      expect(valuesSection.indexOf('Second')).toBeLessThan(valuesSection.indexOf('Third'));
    });

    it('should show top 3 slices for large pie charts', () => {
      const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const values = [10, 20, 30, 40, 50, 60, 70];
      const description = describeBarChart(labels, values, defaultOptions, 'pie');

      // Should limit to top slices for large datasets
      expect(description).toContain('70');
      expect(description).toContain('60');
      expect(description).toContain('50');
    });
  });

  describe('currency formatting', () => {
    it('should format values as currency when specified', () => {
      const labels = ['Q1', 'Q2', 'Q3'];
      const values = [1000, 2000, 3000];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        yAxisCurrency: 'USD'
      };
      const description = describeBarChart(labels, values, options);

      expect(description).toContain('$');
      expect(description).toContain('1,000');
      expect(description).toContain('3,000');
    });
  });

  describe('custom units', () => {
    it('should generate description without units (current limitation)', () => {
      const labels = ['Jan', 'Feb', 'Mar'];
      const values = [100, 150, 200];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        yUnit: 'widgets'
      };
      const description = describeBarChart(labels, values, options);

      // Note: Bar chart categorical descriptions don't currently include units
      // This is different from trend descriptions which do include units
      expect(description).toContain('100');
      expect(description).toContain('200');
    });
  });

  describe('edge cases', () => {
    it('should handle single data point', () => {
      const labels = ['Only'];
      const values = [42];
      const description = describeBarChart(labels, values, defaultOptions);

      expect(description).toContain('42');
      expect(description).toContain('Only');
    });

    it('should handle all same values', () => {
      const labels = ['A', 'B', 'C'];
      const values = [50, 50, 50];
      const description = describeBarChart(labels, values, defaultOptions);

      expect(description).toContain('50');
    });

    it('should handle zero values', () => {
      const labels = ['A', 'B', 'C'];
      const values = [0, 10, 20];
      const description = describeBarChart(labels, values, defaultOptions);

      expect(description).toContain('0');
      expect(description).toContain('20');
    });

    it('should handle negative values', () => {
      const labels = ['Loss', 'Break Even', 'Profit'];
      const values = [-10, 0, 10];
      const description = describeBarChart(labels, values, defaultOptions);

      expect(description).toContain('-10');
      expect(description).toContain('10');
    });
  });

  describe('dataset label', () => {
    it('should not include dataset label in single dataset description', () => {
      const labels = ['A', 'B'];
      const values = [10, 20];
      const description = describeBarChart(labels, values, defaultOptions);

      // The dataset label is not directly in the description,
      // it's added by the plugin when there are multiple datasets
      expect(description).toBeTruthy();
    });
  });
});
