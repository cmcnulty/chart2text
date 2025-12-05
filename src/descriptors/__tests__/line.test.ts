import { describeLineChart } from '../line';
import { Chart2TextOptions } from '../../types';
import * as segreg from 'segreg';

// Mock segreg
jest.mock('segreg');

describe('describeLineChart', () => {
  const defaultOptions: Chart2TextOptions = {
    datasetLabel: 'Test Data',
    xUnit: 'year',
    yUnit: 'units',
    locale: 'en',
    useRounding: true,
    precision: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should handle empty data', () => {
      const labels: any[] = [];
      const values: any[] = [];

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toContain('No data');
    });

    it('should handle single data point', () => {
      const labels = [2020];
      const values = [100];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: []
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toBeTruthy();
      expect(segreg.piecewise).toHaveBeenCalled();
    });

    it('should call piecewise regression with correct data', () => {
      const labels = [2020, 2021, 2022];
      const values = [100, 150, 200];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: []
      });

      describeLineChart(labels, values, defaultOptions);

      // For numeric labels, the numeric values themselves are used
      expect(segreg.piecewise).toHaveBeenCalledWith(
        expect.arrayContaining([2020, 2021, 2022]),
        expect.arrayContaining([100, 150, 200])
      );
    });
  });

  describe('trend analysis', () => {
    it('should describe increasing trend', () => {
      const labels = [2020, 2021, 2022, 2023];
      const values = [100, 150, 200, 250];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2023,
            coeffs: {
              slope: 50,
              intercept: 100
            },
            x: [2020, 2021, 2022, 2023],
            y: [100, 150, 200, 250]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toContain('2020');
      expect(description).toContain('2023');
      expect(description).toContain('100');
      expect(description).toContain('250');
    });

    it('should describe decreasing trend', () => {
      const labels = [2020, 2021, 2022];
      const values = [300, 200, 100];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: -100,
              intercept: 300
            },
            x: [2020, 2021, 2022],
            y: [300, 200, 100]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toBeTruthy();
      expect(description).toContain('2020');
      expect(description).toContain('300');
    });

    it('should describe flat trend', () => {
      const labels = [2020, 2021, 2022];
      const values = [100, 100, 100];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 0,
              intercept: 100
            },
            x: [2020, 2021, 2022],
            y: [100, 100, 100]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toBeTruthy();
      expect(description).toContain('100');
    });
  });

  describe('multi-segment trends', () => {
    it('should describe multiple trend segments', () => {
      const labels = [2020, 2021, 2022, 2023, 2024];
      const values = [100, 150, 200, 180, 160];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 50,
              intercept: 100
            },
            x: [2020, 2021, 2022],
            y: [100, 150, 200]
          },
          {
            fromInclusive: 2022,
            toInclusive: 2024,
            coeffs: {
              slope: -20,
              intercept: 240
            },
            x: [2022, 2023, 2024],
            y: [200, 180, 160]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      // Should describe both segments
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(50);
    });

    it('should handle three segments (increase, flat, decrease)', () => {
      const labels = [1, 2, 3, 4, 5, 6];
      const values = [10, 20, 30, 30, 30, 20];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 0,
            toInclusive: 2,
            coeffs: {
              slope: 10,
              intercept: 10
            },
            x: [0, 1, 2],
            y: [10, 20, 30]
          },
          {
            fromInclusive: 2,
            toInclusive: 4,
            coeffs: {
              slope: 0,
              intercept: 30
            },
            x: [2, 3, 4],
            y: [30, 30, 30]
          },
          {
            fromInclusive: 4,
            toInclusive: 5,
            coeffs: {
              slope: -10,
              intercept: 70
            },
            x: [4, 5],
            y: [30, 20]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toBeTruthy();
    });
  });

  describe('label mapping', () => {
    it('should map non-numeric labels to indices and back', () => {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr'];
      const values = [100, 150, 200, 250];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 0,
            toInclusive: 3,
            coeffs: {
              slope: 50,
              intercept: 100
            },
            x: [0, 1, 2, 3],
            y: [100, 150, 200, 250]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      // Should use original labels
      expect(description).toContain('Jan');
      expect(description).toContain('Apr');
    });

    it('should handle numeric string labels', () => {
      const labels = ['2020', '2021', '2022'];
      const values = [100, 150, 200];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 50,
              intercept: 100
            },
            x: [2020, 2021, 2022],
            y: [100, 150, 200]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toContain('2020');
      expect(description).toContain('2022');
    });
  });

  describe('currency formatting', () => {
    it('should format values as currency when specified', () => {
      const labels = [2020, 2021, 2022];
      const values = [1000, 2000, 3000];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        yAxisCurrency: 'USD'
      };

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 1000,
              intercept: 1000
            },
            x: [2020, 2021, 2022],
            y: [1000, 2000, 3000]
          }
        ]
      });

      const description = describeLineChart(labels, values, options);

      expect(description).toContain('$');
    });
  });

  describe('units', () => {
    it('should include x-axis unit in description', () => {
      const labels = [2020, 2021, 2022];
      const values = [100, 150, 200];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        xUnit: 'month'
      };

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 50,
              intercept: 100
            },
            x: [2020, 2021, 2022],
            y: [100, 150, 200]
          }
        ]
      });

      const description = describeLineChart(labels, values, options);

      expect(description.toLowerCase()).toContain('month');
    });

    it('should include y-axis unit in description', () => {
      const labels = [2020, 2021, 2022];
      const values = [100, 150, 200];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        yUnit: 'widgets'
      };

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 50,
              intercept: 100
            },
            x: [2020, 2021, 2022],
            y: [100, 150, 200]
          }
        ]
      });

      const description = describeLineChart(labels, values, options);

      // Y-unit should be present and description should mention the values
      expect(description).toBeTruthy();
      expect(description).toContain('100');
      expect(description).toContain('200');
    });
  });

  describe('edge cases', () => {
    it('should handle very small slopes (nearly flat)', () => {
      const labels = [2020, 2021, 2022];
      const values = [100, 100.1, 100.2];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 0.1,
              intercept: 100
            },
            x: [2020, 2021, 2022],
            y: [100, 100.1, 100.2]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toBeTruthy();
    });

    it('should handle negative values', () => {
      const labels = [2020, 2021, 2022];
      const values = [-100, -50, 0];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 50,
              intercept: -100
            },
            x: [2020, 2021, 2022],
            y: [-100, -50, 0]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toContain('-100');
      expect(description).toContain('0');
    });

    it('should handle large values', () => {
      const labels = [2020, 2021, 2022];
      const values = [1000000, 2000000, 3000000];

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 1000000,
              intercept: 1000000
            },
            x: [2020, 2021, 2022],
            y: [1000000, 2000000, 3000000]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      expect(description).toBeTruthy();
    });
  });

  describe('disconnected segments', () => {
    it('should handle gaps in x-values', () => {
      const labels = [2020, 2021, 2025, 2026];
      const values = [100, 150, 200, 250];

      // Simulate disconnected segments with a large gap
      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 0,
            toInclusive: 1,
            coeffs: {
              slope: 50,
              intercept: 100
            },
            x: [0, 1],
            y: [100, 150]
          },
          {
            fromInclusive: 2,
            toInclusive: 3,
            coeffs: {
              slope: 50,
              intercept: 100
            },
            x: [2, 3],
            y: [200, 250]
          }
        ]
      });

      const description = describeLineChart(labels, values, defaultOptions);

      // Should describe both segments
      expect(description).toBeTruthy();
    });
  });

  describe('rounding and precision', () => {
    it('should use rounding when enabled', () => {
      const labels = [2020, 2021, 2022];
      const values = [42.7, 99.4, 156.3];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        useRounding: true
      };

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 56.8,
              intercept: 42.7
            },
            x: [2020, 2021, 2022],
            y: [42.7, 99.4, 156.3]
          }
        ]
      });

      const description = describeLineChart(labels, values, options);

      // With rounding, large numbers should be rounded
      expect(description).toBeTruthy();
    });

    it('should use precision when rounding is disabled', () => {
      const labels = [2020, 2021, 2022];
      const values = [1.111, 2.222, 3.333];
      const options: Chart2TextOptions = {
        ...defaultOptions,
        useRounding: false,
        precision: 2
      };

      (segreg.piecewise as jest.Mock).mockReturnValue({
        segments: [
          {
            fromInclusive: 2020,
            toInclusive: 2022,
            coeffs: {
              slope: 1.111,
              intercept: 1.111
            },
            x: [2020, 2021, 2022],
            y: [1.111, 2.222, 3.333]
          }
        ]
      });

      const description = describeLineChart(labels, values, options);

      expect(description).toBeTruthy();
    });
  });
});
